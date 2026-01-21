import { prisma } from "./prisma";

interface FlowNodeData {
    text?: string;
    trigger?: string;
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
    [key: string]: any;
}

export async function processMessage(botId: string, telegramChatId: string, messageText: string) {
    console.log(`[FlowEngine] Processing message from ${telegramChatId}: ${messageText}`);

    // 1. Find a matching trigger
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

    for (const triggerNode of triggerNodes) {
        const nodeData = triggerNode.data as unknown as FlowNodeData;
        const keyword = nodeData.trigger?.toLowerCase();

        if (keyword && messageText.toLowerCase().includes(keyword)) {
            console.log(`[FlowEngine] Trigger matched! Starting flow: ${triggerNode.flow.name}`);
            await executeNextNodes(triggerNode.flowId, triggerNode.id, telegramChatId, botId);
            return; // Only execute one flow per trigger for now
        }
    }
}

async function executeNextNodes(flowId: string, currentNodeId: string, chatId: string, botId: string) {
    const edges = await prisma.flowEdge.findMany({
        where: {
            flowId,
            sourceNodeId: currentNodeId
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
    const data = node.data as FlowNodeData;
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return true;

    console.log(`[FlowEngine] Executing node: ${node.type} (${data.subType || ''})`);

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
                // Approximate reading/typing time: 10 chars per second
                delayMs = Math.min(delayMs, 10000); // Caps at 10s for UX
            }

            if (data.showTyping) {
                await sendTelegramRequest(bot.token, 'sendChatAction', {
                    chat_id: chatId,
                    action: 'typing'
                });
            }
            await new Promise(resolve => setTimeout(resolve, delayMs));
            break;

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
        const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            console.error(`[FlowEngine] Telegram API Error (${method}): ${await response.text()}`);
        }
    } catch (error) {
        console.error(`[FlowEngine] Fetch Error (${method}):`, error);
    }
}
