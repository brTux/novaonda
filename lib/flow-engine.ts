import { prisma } from "./prisma";

interface FlowNodeData {
    text?: string;
    trigger?: string;
    triggerType?: 'KEYWORD' | 'COMMAND' | 'TAG' | 'NEW_LEAD';
    url?: string;
    caption?: string;
    delay?: number;
    isSmart?: boolean;
    showTyping?: boolean;
    hasButtons?: boolean;
    buttons?: Array<{ label: string; url?: string; flowId?: string }>;
    subType?: string;
    amount?: number;
    pixKey?: string;
    variable?: string;
    inputType?: string;
    timeout?: number;
    [key: string]: any;
}

export async function processMessage(botId: string, telegramChatId: string, messageText: string) {
    console.log(`[FlowEngine] Processing message from ${telegramChatId}: ${messageText}`);

    const conversation = await prisma.conversation.findUnique({
        where: { botId_telegramChatId: { botId, telegramChatId } }
    });

    // 1. Check if we are waiting for an input from a previous node
    if (conversation?.waitingForNodeId) {
        const waitingNode = await prisma.flowNode.findUnique({
            where: { id: conversation.waitingForNodeId }
        });

        if (waitingNode) {
            const now = new Date();
            const isTimeout = conversation.waitingTimeout && now > conversation.waitingTimeout;

            if (isTimeout) {
                console.log(`[FlowEngine] Input timeout reached for node ${waitingNode.id}`);
                await clearWaitingState(conversation.id);
                await executeNextNodes(waitingNode.flowId, waitingNode.id, telegramChatId, botId, 'timeout');
                // After timeout, we STILL process the current message as a new trigger? 
                // Usually yes, unless the timeout logic also "consumes" this message.
                // Decoupling: Timeout path already executed, now see if this message triggers something else.
            } else {
                console.log(`[FlowEngine] Input received for node ${waitingNode.id}`);
                // Save the variable!
                const data = waitingNode.data as unknown as FlowNodeData;
                if (data.variable) {
                    await saveVariable(conversation.id, data.variable, messageText);
                }
                await clearWaitingState(conversation.id);
                await executeNextNodes(waitingNode.flowId, waitingNode.id, telegramChatId, botId, 'success');
                return; // Response consumed
            }
        }
    }

    // 2. Try to match triggers
    const triggerNodes = await prisma.flowNode.findMany({
        where: {
            flow: {
                botId: botId,
                status: 'PUBLISHED',
            },
            type: 'TRIGGER',
        },
        include: {
            flow: true
        }
    });

    console.log(`[FlowEngine] Found ${triggerNodes.length} trigger nodes for bot ${botId}`);

    for (const triggerNode of triggerNodes) {
        let nodeData = triggerNode.data as any;
        if (typeof nodeData === 'string') {
            try {
                nodeData = JSON.parse(nodeData);
            } catch (e) {
                console.error("[FlowEngine] Error parsing node data", e);
                continue;
            }
        }

        const type = nodeData.triggerType || 'KEYWORD';
        const keyword = nodeData.trigger?.toLowerCase();

        console.log(`[FlowEngine] Checking trigger: type=${type}, keyword=${keyword}, input=${messageText}`);

        let IsMatched = false;

        if (type === 'KEYWORD' && keyword && messageText.toLowerCase().includes(keyword)) {
            IsMatched = true;
        } else if (type === 'COMMAND' && keyword && messageText.toLowerCase() === keyword.toLowerCase()) {
            IsMatched = true;
        } else if (type === 'NEW_LEAD' && (messageText.toLowerCase() === '/start' || messageText.toLowerCase() === 'start')) {
            IsMatched = true;
        }

        if (IsMatched) {
            console.log(`[FlowEngine] Trigger matched (${type})! Starting flow: ${triggerNode.flow.name}`);
            await executeNextNodes(triggerNode.flowId, triggerNode.id, telegramChatId, botId);
            return;
        }
    }
}

async function executeNextNodes(flowId: string, currentNodeId: string, chatId: string, botId: string, sourceHandle?: string) {
    const edges = await prisma.flowEdge.findMany({
        where: {
            flowId,
            sourceNodeId: currentNodeId,
            ...(sourceHandle ? { sourceHandle } : {})
        }
    });

    for (const edge of edges) {
        const nextNode = await prisma.flowNode.findUnique({
            where: { id: edge.targetNodeId }
        });

        if (nextNode) {
            const shouldStop = await executeNode(nextNode, chatId, botId);
            if (shouldStop) break;

            // Recursively continue if it's not a waiting node or end node
            if (nextNode.type !== 'INPUT' && (nextNode.data as any).subType !== 'END') {
                await executeNextNodes(flowId, nextNode.id, chatId, botId);
            }
        }
    }
}

async function executeNode(node: any, chatId: string, botId: string) {
    let data = node.data as any;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("[FlowEngine] Error parsing node data in executeNode", e);
            return false;
        }
    }

    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) {
        console.error(`[FlowEngine] Bot not found: ${botId}`);
        return true;
    }

    console.log(`[FlowEngine] Executing node: ${node.type} (${data.subType || ''}) for chat ${chatId}`);

    switch (node.type) {
        case 'MESSAGE':
            if (data.text) {
                const replyMarkup = data.hasButtons && data.buttons?.length
                    ? { inline_keyboard: [data.buttons.map(b => ({ text: b.label, url: b.url }))] }
                    : undefined;

                await sendTelegramRequest(bot.token, 'sendMessage', {
                    chat_id: chatId,
                    text: data.text,
                    reply_markup: replyMarkup
                });
                await saveBotMessage(botId, chatId, data.text);
            }
            break;

        case 'IMAGE':
            if (data.url) {
                await sendTelegramRequest(bot.token, 'sendPhoto', {
                    chat_id: chatId,
                    photo: data.url,
                    caption: data.caption
                });
                await saveBotMessage(botId, chatId, `[Imagem] ${data.caption || ''}`);
            }
            break;

        case 'VIDEO':
            if (data.url) {
                await sendTelegramRequest(bot.token, 'sendVideo', {
                    chat_id: chatId,
                    video: data.url,
                    caption: data.caption
                });
                await saveBotMessage(botId, chatId, `[Vídeo] ${data.caption || ''}`);
            }
            break;

        case 'AUDIO':
            if (data.url) {
                await sendTelegramRequest(bot.token, 'sendAudio', {
                    chat_id: chatId,
                    audio: data.url,
                    caption: data.caption
                });
                await saveBotMessage(botId, chatId, `[Áudio] ${data.caption || ''}`);
            }
            break;

        case 'DELAY':
            let delayMs = (data.delay || 3) * 1000;
            if (data.isSmart) {
                delayMs = Math.min(delayMs, 10000);
            }

            if (data.showTyping) {
                await sendTelegramRequest(bot.token, 'sendChatAction', {
                    chat_id: chatId,
                    action: 'typing'
                });
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            break;

        case 'INPUT':
            // Set waiting state
            const timeoutSeconds = data.timeout || 60;
            const timeoutDate = new Date(Date.now() + timeoutSeconds * 1000);

            await prisma.conversation.updateMany({
                where: { botId, telegramChatId: chatId },
                data: {
                    waitingForNodeId: node.id,
                    waitingTimeout: timeoutDate
                }
            });

            // Start a timer for the timeout path (failsafe)
            setTimeout(async () => {
                const conv = await prisma.conversation.findUnique({
                    where: { botId_telegramChatId: { botId, telegramChatId: chatId } }
                });
                if (conv && conv.waitingForNodeId === node.id) {
                    console.log(`[FlowEngine] Async Timeout reached for node ${node.id}`);
                    await clearWaitingState(conv.id);
                    await executeNextNodes(node.flowId, node.id, chatId, botId, 'timeout');
                }
            }, timeoutSeconds * 1000);

            return true; // Stop execution until response or timeout

        case 'ACTION':
            if (data.subType === 'PIX' || data.subType === 'PIX_CUSTOM') {
                const text = `💠 *Pagamento Pix Gerado*\n\nValor: R$ ${data.amount}\nChave: \`${data.pixKey || 'sua-chave-aqui'}\`\n\n_Copie a chave acima para pagar._`;
                await sendTelegramRequest(bot.token, 'sendMessage', {
                    chat_id: chatId,
                    text,
                    parse_mode: 'Markdown'
                });
                await saveBotMessage(botId, chatId, text);
            } else if (data.subType === 'CHECKOUT') {
                const text = `🛒 *Seu Link de Checkout*\n\nClique no botão abaixo para finalizar sua compra.`;
                await sendTelegramRequest(bot.token, 'sendMessage', {
                    chat_id: chatId,
                    text,
                    parse_mode: 'Markdown',
                    reply_markup: { inline_keyboard: [[{ text: "Pagar Agora", url: data.url }]] }
                });
                await saveBotMessage(botId, chatId, text);
            } else if (data.subType === 'END') {
                return true; // Stop execution
            }
            break;
    }
    return false;
}

async function clearWaitingState(conversationId: string) {
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            waitingForNodeId: null,
            waitingTimeout: null
        }
    });
}

async function saveVariable(conversationId: string, name: string, value: string) {
    // For now, let's just log it or we could add a Variables model
    console.log(`[FlowEngine] Saving variable {{${name}}} = ${value} for conversation ${conversationId}`);
}

async function saveBotMessage(botId: string, chatId: string, text: string) {
    const conversation = await prisma.conversation.findUnique({
        where: { botId_telegramChatId: { botId, telegramChatId: chatId } }
    });
    if (conversation) {
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: text,
                sender: 'BOT',
                type: 'TEXT'
            }
        });
    }
}

async function sendTelegramRequest(token: string, method: string, body: any) {
    try {
        console.log(`[FlowEngine] Sending Telegram request: ${method}`);
        const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            console.error(`[FlowEngine] Telegram API Error (${method}):`, JSON.stringify(result));
        } else {
            console.log(`[FlowEngine] Telegram API Success (${method})`);
        }
        return result;
    } catch (error) {
        console.error(`[FlowEngine] Fetch Error (${method}):`, error);
        return { ok: false, error };
    }
}
