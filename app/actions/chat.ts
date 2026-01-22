'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleTagTrigger } from "@/lib/flow-engine";

// Fetch list of conversations for the current user's bots
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Get conversations where the bot belongs to the user
    const conversations = await prisma.conversation.findMany({
        where: {
            bot: {
                userId: session.user.id,
            },
        },
        include: {
            bot: {
                select: {
                    name: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 1, // Get the last message for preview
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    // Serialize dates and structure for the UI
    return conversations.map((conv) => ({
        id: conv.id,
        name: conv.firstName
            ? `${conv.firstName} ${conv.lastName || ""}`.trim()
            : conv.username || `User ${conv.telegramUserId}`,
        avatar: conv.firstName ? conv.firstName[0].toUpperCase() : "?",
        lastMessage: conv.messages[0]?.content || "Iniciou uma conversa",
        timestamp: conv.messages[0]?.createdAt || conv.updatedAt,
        unread: 0, // TODO: Implement unread count later
        botName: conv.bot.name,
        botId: conv.botId,
        telegramUserId: conv.telegramUserId,
        tags: conv.tags || [],
        ip: conv.ip,
        city: conv.city,
        state: conv.state,
        latitude: conv.latitude,
        longitude: conv.longitude,
        utmSource: conv.utmSource,
        utmMedium: conv.utmMedium,
        utmCampaign: conv.utmCampaign,
        utmContent: conv.utmContent,
    }));
}

// Fetch transactions for a conversation
export async function getTransactions(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const transactions = await prisma.transaction.findMany({
        where: { conversationId },
        orderBy: { createdAt: "desc" },
    });

    return transactions.map((t: any) => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        provider: t.provider,
        createdAt: t.createdAt,
        paidAt: t.paidAt
    }));
}

// Update conversation tags
export async function updateConversationTags(conversationId: string, tags: string[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        const oldTags = conversation.tags || [];
        const newTags = tags.filter(t => !oldTags.includes(t));

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { tags: { set: tags } }
        });

        // Trigger flows for EACH new tag added
        for (const tag of newTags) {
            console.log(`[ChatAction] Manual tag added: ${tag}. Triggering flows...`);
            await handleTagTrigger(conversation.botId, conversation.telegramChatId, tag);
        }

        return { success: true };
    } catch (error) {
        console.error("UpdateTags Error:", error);
        return { error: "Failed to update tags" };
    }
}

// Fetch messages for a specific conversation
export async function getMessages(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Verify ownership (security)
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { bot: true }
    });

    if (!conversation || conversation.bot.userId !== session.user.id) {
        return [];
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
    });

    return messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender, // 'USER' | 'BOT' | 'AGENT'
        createdAt: msg.createdAt,
        type: msg.type,
    }));
}

// Send a text message (to be implemented with Telegram API later for real sending)
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Conversation not found" };
        }

        // 1. Save to DB
        const newMessage = await prisma.message.create({
            data: {
                conversationId,
                content,
                sender: "AGENT", // Sent by the dashboard user
                type: "TEXT"
            }
        });

        // 2. Send to Telegram (via API) - Placeholder for now
        // await telegramClient.sendMessage(conversation.telegramChatId, content, token);
        const botToken = conversation.bot.token;
        const chatId = conversation.telegramChatId;

        const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: content
            })
        });

        if (!telegramResponse.ok) {
            console.error("Failed to send to Telegram", await telegramResponse.text());
            return { error: "Failed to send to Telegram", message: newMessage };
        }

        return { success: true, message: newMessage };

    } catch (error) {
        console.error("SendMessage Error:", error);
        return { error: "Internal Error" };
    }
}
