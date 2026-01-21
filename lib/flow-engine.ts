import { prisma } from "./prisma";

interface FlowNodeData {
    text?: string;
    trigger?: string;
    [key: string]: any;
}

export async function processMessage(botId: string, telegramChatId: string, messageText: string) {
    console.log(`[FlowEngine] Processing message from ${telegramChatId}: ${messageText}`);

    // 1. Find a matching trigger in any flow associated with this bot
    const triggerNode = await prisma.flowNode.findFirst({
        where: {
            flow: {
                botId: botId,
                status: 'PUBLISHED', // Only published flows trigger automatically
            },
            type: 'TRIGGER',
        },
        include: {
            flow: true
        }
    });

    if (!triggerNode) {
        // Fallback: Check for a default flow or just ignore
        console.log(`[FlowEngine] No trigger found for bot ${botId}`);
        return;
    }

    // Check if message matches the keyword (case insensitive for now)
    const nodeData = triggerNode.data as unknown as FlowNodeData;
    const keyword = nodeData.trigger?.toLowerCase();

    if (keyword && messageText.toLowerCase().includes(keyword)) {
        console.log(`[FlowEngine] Trigger matched! Starting flow: ${triggerNode.flow.name}`);
        await executeNextNodes(triggerNode.flowId, triggerNode.id, telegramChatId, botId);
    }
}

async function executeNextNodes(flowId: string, currentNodeId: string, chatId: string, botId: string) {
    // 1. Find outgoing edges
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
            await executeNode(nextNode, chatId, botId);
            // Recursively continue if it's not a waiting node
            if (nextNode.type !== 'INPUT' && nextNode.type !== 'DELAY') {
                await executeNextNodes(flowId, nextNode.id, chatId, botId);
            }
        }
    }
}

async function executeNode(node: any, chatId: string, botId: string) {
    const data = node.data as FlowNodeData;
    const bot = await prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return;

    switch (node.type) {
        case 'MESSAGE':
            if (data.text) {
                await sendTelegramMessage(bot.token, chatId, data.text);

                // Also save the message to our DB so it shows in chat
                const conversation = await prisma.conversation.findUnique({
                    where: { botId_telegramChatId: { botId, telegramChatId: chatId } }
                });

                if (conversation) {
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            content: data.text,
                            sender: 'BOT',
                            type: 'TEXT'
                        }
                    });
                }
            }
            break;

        case 'DELAY':
            // TODO: Implement actual delay/typing indicator
            // For now just a placeholder
            console.log(`[FlowEngine] Node DELAY: ${data.delay || 3}s`);
            break;

        // Add other node types here (MEDIA, ACTION, etc.)
    }
}

async function sendTelegramMessage(token: string, chatId: string, text: string) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text
            })
        });

        if (!response.ok) {
            console.error(`[FlowEngine] Telegram API Error: ${await response.text()}`);
        }
    } catch (error) {
        console.error(`[FlowEngine] Fetch Error:`, error);
    }
}
