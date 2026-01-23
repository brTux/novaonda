import { db } from "./db";
import * as schema from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PaymentGatewayFactory } from "./payments/factory";

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

    const conversation = await db.query.conversations.findFirst({
        where: and(
            eq(schema.conversations.botId, botId),
            eq(schema.conversations.telegramChatId, telegramChatId)
        )
    });

    // 0. Check if the conversation is paused (Manual Agent mode)
    if (conversation?.isPaused) {
        console.log(`[FlowEngine] Conversation ${telegramChatId} is PAUSED. Skipping bot processing.`);
        return;
    }

    // 1. Check if we are waiting for an input from a previous node
    if (conversation?.waitingForNodeId) {
        const waitingNode = await db.query.flowNodes.findFirst({
            where: eq(schema.flowNodes.id, conversation.waitingForNodeId)
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
    const triggerNodes = await db.query.flowNodes.findMany({
        where: ((flowNodes: any, { exists }: any) => exists(
            db.select().from(schema.flows)
                .where(and(
                    eq(schema.flows.id, flowNodes.flowId),
                    eq(schema.flows.botId, botId),
                    eq(schema.flows.status, 'PUBLISHED')
                ))
        )) as any,
        with: {
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

export async function handleTagTrigger(botId: string, telegramChatId: string, tagName: string) {
    console.log(`[FlowEngine] Checking TAG triggers for bot ${botId}, tag: ${tagName}`);

    const triggerNodes = await db.query.flowNodes.findMany({
        where: ((flowNodes: any, { exists }: any) => exists(
            db.select().from(schema.flows)
                .where(and(
                    eq(schema.flows.id, flowNodes.flowId),
                    eq(schema.flows.botId, botId),
                    eq(schema.flows.status, 'PUBLISHED')
                ))
        )) as any,
        with: {
            flow: true
        }
    });

    for (const triggerNode of triggerNodes) {
        let nodeData = triggerNode.data as any;
        if (typeof nodeData === 'string') {
            try {
                nodeData = JSON.parse(nodeData);
            } catch (e) {
                continue;
            }
        }

        const type = nodeData.triggerType;
        const triggerTag = nodeData.trigger?.trim();

        if (type === 'TAG' && triggerTag === tagName) {
            console.log(`[FlowEngine] Tag trigger matched! Starting flow: ${triggerNode.flow.name}`);
            await executeNextNodes(triggerNode.flowId, triggerNode.id, telegramChatId, botId);
            // We return after first match? Or allow multiple? Usually one flow per trigger event.
            return;
        }
    }
}

export async function startFlow(flowId: string, botId: string, telegramChatId: string) {
    console.log(`[FlowEngine] Starting flow ${flowId} for ${telegramChatId}`);

    // 1. Find trigger nodes for this flow
    const triggerNodes = await db.query.flowNodes.findMany({
        where: and(
            eq(schema.flowNodes.flowId, flowId),
            eq(schema.flowNodes.type, 'TRIGGER')
        )
    });

    if (triggerNodes.length === 0) {
        console.warn(`[FlowEngine] No trigger nodes found for flow ${flowId}`);
        return;
    }

    // 2. Execute next nodes for each trigger (usually there is only one start trigger)
    for (const triggerNode of triggerNodes) {
        await executeNextNodes(flowId, triggerNode.id, telegramChatId, botId);
    }
}

export async function executeNextNodes(flowId: string, currentNodeId: string, chatId: string, botId: string, sourceHandle?: string) {
    const edges = await db.query.flowEdges.findMany({
        where: sourceHandle
            ? and(
                eq(schema.flowEdges.flowId, flowId),
                eq(schema.flowEdges.sourceNodeId, currentNodeId),
                eq(schema.flowEdges.sourceHandle, sourceHandle)
            )
            : and(
                eq(schema.flowEdges.flowId, flowId),
                eq(schema.flowEdges.sourceNodeId, currentNodeId)
            )
    });

    for (const edge of edges) {
        const nextNode = await db.query.flowNodes.findFirst({
            where: eq(schema.flowNodes.id, edge.targetNodeId)
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

    const bot = await db.query.bots.findFirst({
        where: eq(schema.bots.id, botId)
    });

    if (!bot) {
        console.error(`[FlowEngine] Bot not found: ${botId}`);
        return true;
    }

    console.log(`[FlowEngine] Executing node: ${node.type} (${data.subType || ''}) for chat ${chatId}`);

    switch (node.type) {
        case 'MESSAGE':
            if (data.text) {
                const replyMarkup = data.hasButtons && data.buttons?.length
                    ? { inline_keyboard: [data.buttons.map((b: any) => ({ text: b.label, url: b.url }))] }
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

            await db.update(schema.conversations)
                .set({
                    waitingForNodeId: node.id,
                    waitingTimeout: timeoutDate
                })
                .where(and(
                    eq(schema.conversations.botId, botId),
                    eq(schema.conversations.telegramChatId, chatId)
                ));

            // Start a timer for the timeout path (failsafe)
            setTimeout(async () => {
                const conv = await db.query.conversations.findFirst({
                    where: and(
                        eq(schema.conversations.botId, botId),
                        eq(schema.conversations.telegramChatId, chatId)
                    )
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
                // 1. Find user and their active payment credential
                const credential = await db.query.paymentCredentials.findFirst({
                    where: and(
                        eq(schema.paymentCredentials.userId, bot.userId),
                        eq(schema.paymentCredentials.isActive, true)
                    )
                });

                if (!credential) {
                    const errorMsg = "❌ Erro: Configuração de pagamento não encontrada. Contacte o administrador.";
                    await sendTelegramRequest(bot.token, 'sendMessage', { chat_id: chatId, text: errorMsg });
                    return true;
                }

                try {
                    // 2. Instantiate gateway and generate PIX
                    const gateway = PaymentGatewayFactory.create(credential.provider, credential.token, credential.secret || undefined);
                    const amount = data.amount ? Math.round(data.amount * 100) : 50; // default 0.50 cents if not set

                    // Robust URL Construction
                    const baseUrl = (process.env.NEXTAUTH_URL || 'https://novaonda-production.up.railway.app').replace(/\/$/, "");
                    const webhookUrl = `${baseUrl}/api/webhooks/payments/${credential.provider.toLowerCase()}`;

                    console.log(`[FlowEngine] GENERATING PIX: amount=${amount} webhookUrl=${webhookUrl}`);

                    const pixResponse = await gateway.generatePix({
                        value: amount,
                        webhook_url: webhookUrl
                    });

                    console.log(`[FlowEngine] GATEWAY RESPONSE: id=${pixResponse.id} status=${pixResponse.status}`);

                    // 3. Save Transaction
                    const conv = await db.query.conversations.findFirst({
                        where: and(
                            eq(schema.conversations.botId, botId),
                            eq(schema.conversations.telegramChatId, chatId)
                        )
                    });

                    const transactionResult = await db.insert(schema.transactions).values({
                        externalId: pixResponse.id.toString().toLowerCase(),
                        provider: credential.provider,
                        amount: amount,
                        status: 'PENDING',
                        pixCopyPaste: pixResponse.pixCopyPaste || null,
                        pixQrCodeBase64: pixResponse.pixQrCodeBase64 || null,
                        paidTag: data.paidTag || null,
                        conversationId: conv?.id || ""
                    }).returning();

                    const transaction = transactionResult[0];

                    console.log(`[FlowEngine] TRANSACTION CREATED: dbId=${transaction.id} externalId=${transaction.externalId}`);

                    // 4. Trigger Meta CAPI Event (InitiateCheckout)
                    if (bot.pixelId && bot.capiToken && conv) {
                        try {
                            const { sendMetaEvent } = await import("@/lib/meta");
                            await sendMetaEvent({
                                eventName: "InitiateCheckout",
                                pixelId: bot.pixelId,
                                accessToken: bot.capiToken,
                                testEventCode: bot.testEventCode || undefined,
                                user: {
                                    ip: conv.ip || undefined,
                                    userAgent: "Telegram Bot", // We don't have the original web user agent here usually, but we have IP
                                    fbc: conv.fbc || undefined,
                                    fbp: conv.fbp || undefined,
                                },
                                customData: {
                                    value: amount / 100,
                                    currency: "BRL",
                                    content_name: "Geração de Pix",
                                    order_id: transaction.id
                                }
                            });
                        } catch (capiErr) {
                            console.error("[FlowEngine] CAPI Error:", capiErr);
                        }
                    }

                    const text = `💠 *Pagamento Pix Gerado*\n\nValor: R$ ${(amount / 100).toFixed(2)}\n\n*Copia e Cola:*\n\`${pixResponse.pixCopyPaste}\`\n\n_Copie o código acima e pague no seu banco._`;

                    await sendTelegramRequest(bot.token, 'sendMessage', {
                        chat_id: chatId,
                        text,
                        parse_mode: 'Markdown'
                    });

                    if (pixResponse.pixQrCodeBase64) {
                        // We could send the image too, but for now Copy and Paste is most practical
                    }

                    await saveBotMessage(botId, chatId, text);
                } catch (err) {
                    console.error("[FlowEngine] Payment Generation Error:", err);
                    await sendTelegramRequest(bot.token, 'sendMessage', {
                        chat_id: chatId,
                        text: "❌ Ocorreu um erro ao gerar seu PIX. Tente novamente em instantes."
                    });
                }
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
    await db.update(schema.conversations)
        .set({
            waitingForNodeId: null,
            waitingTimeout: null
        })
        .where(eq(schema.conversations.id, conversationId));
}

async function saveVariable(conversationId: string, name: string, value: string) {
    // For now, let's just log it or we could add a Variables model
    console.log(`[FlowEngine] Saving variable {{${name}}} = ${value} for conversation ${conversationId}`);
}

async function saveBotMessage(botId: string, chatId: string, text: string) {
    const conversation = await db.query.conversations.findFirst({
        where: and(
            eq(schema.conversations.botId, botId),
            eq(schema.conversations.telegramChatId, chatId)
        )
    });

    if (conversation) {
        await db.insert(schema.messages).values({
            conversationId: conversation.id,
            content: text,
            sender: 'BOT',
            type: 'TEXT'
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
