'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { handleTagTrigger } from "@/lib/flow-engine";
import * as schema from "@/db/schema";
import { eq, desc, and, like, arrayContains, or, isNull } from "drizzle-orm"; // Import operators

// Fetch list of conversations for the current user's bots
export async function getConversations() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Get conversations where the bot belongs to the user
    // We need to join with bots table to filter by userId
    // Drizzle Query API handles relations nicely
    const conversations = await db.query.conversations.findMany({
        where: ((conversations: any, { exists }: any) => exists(
            db.select().from(schema.bots)
                .where(and(
                    eq(schema.bots.id, conversations.botId),
                    eq(schema.bots.userId, session.user!.id!)
                ))
        )) as any,
        with: {
            bot: {
                columns: {
                    name: true,
                }
            },
            messages: {
                orderBy: [desc(schema.messages.createdAt)],
                limit: 1,
            }
        },
        orderBy: [desc(schema.conversations.updatedAt)],
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
        unread: 0,
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
        isPaused: conv.isPaused,
    }));
}

// Fetch transactions for a conversation
export async function getTransactions(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const transactions = await db.query.transactions.findMany({
        where: eq(schema.transactions.conversationId, conversationId),
        orderBy: [desc(schema.transactions.createdAt)],
    });

    return transactions.map((t) => ({
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
        const conversation = await db.query.conversations.findFirst({
            where: eq(schema.conversations.id, conversationId),
            with: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        const oldTags: string[] = (conversation.tags as string[]) || []; // Ensure typed as array
        const newTags = tags.filter(t => !oldTags.includes(t));

        await db.update(schema.conversations)
            .set({ tags: tags as any }) // Cast as any because Drizzle array handling can be tricky with types sometimes
            .where(eq(schema.conversations.id, conversationId));

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
    const conversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, conversationId),
        with: { bot: true }
    });

    if (!conversation || conversation.bot.userId !== session.user.id) {
        return [];
    }

    const messages = await db.query.messages.findMany({
        where: eq(schema.messages.conversationId, conversationId),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    return messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        createdAt: msg.createdAt,
        type: msg.type,
    }));
}

// Send a text message
export async function sendMessage(conversationId: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const conversation = await db.query.conversations.findFirst({
            where: eq(schema.conversations.id, conversationId),
            with: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Conversation not found" };
        }

        // 1. Save to DB
        const result = await db.insert(schema.messages).values({
            conversationId,
            content,
            sender: "AGENT",
            type: "TEXT"
        }).returning();

        const newMessage = result[0];

        // 2. Send to Telegram (via API)
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

// Toggle conversation pause status
export async function togglePauseConversation(conversationId: string, isPaused: boolean) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const conversation = await db.query.conversations.findFirst({
            where: eq(schema.conversations.id, conversationId),
            with: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        await db.update(schema.conversations)
            .set({ isPaused })
            .where(eq(schema.conversations.id, conversationId));

        return { success: true };
    } catch (error) {
        console.error("TogglePause Error:", error);
        return { error: "Internal Error" };
    }
}

// Delete a conversation
export async function deleteConversation(conversationId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const conversation = await db.query.conversations.findFirst({
            where: eq(schema.conversations.id, conversationId),
            with: { bot: true }
        });

        if (!conversation || conversation.bot.userId !== session.user.id) {
            return { error: "Unauthorized" };
        }

        await db.delete(schema.conversations)
            .where(eq(schema.conversations.id, conversationId));

        return { success: true };
    } catch (error) {
        console.error("DeleteConversation Error:", error);
        return { error: "Internal Error" };
    }
}

// Trigger a flow manually for a user
export async function triggerFlowForUser(botId: string, telegramChatId: string, flowId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const { startFlow } = await import("@/lib/flow-engine");
        await startFlow(flowId, botId, telegramChatId);

        return { success: true };
    } catch (error) {
        console.error("TriggerFlow Error:", error);
        return { error: "Internal Error" };
    }
}

// Advanced Lead filtering for CRM
export async function getLeads(filters: { botId?: string, tag?: string, search?: string }) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const conversations = await db.query.conversations.findMany({
        where: (cols, { exists, and, eq, or, like }) => {
            const conditions = [
                exists(
                    db.select().from(schema.bots)
                        .where(and(
                            eq(schema.bots.id, cols.botId),
                            eq(schema.bots.userId, session.user!.id!)
                        ))
                )
            ];

            if (filters.botId) {
                conditions.push(eq(cols.botId, filters.botId));
            }

            if (filters.tag) {
                conditions.push(arrayContains(schema.conversations.tags, [filters.tag]));
            }

            if (filters.search) {
                const search = `%${filters.search}%`;
                const searchConditions = [
                    like(cols.firstName, search),
                    like(cols.lastName, search),
                    like(cols.username, search),
                    like(cols.telegramUserId, search),
                ].filter((c): c is any => c !== undefined);

                if (searchConditions.length > 0) {
                    conditions.push(or(...searchConditions));
                }
            }

            const validConditions = conditions.filter((c): c is any => c !== undefined);

            return validConditions.length > 0 ? and(...(validConditions as any)) : undefined;
        },
        with: {
            bot: {
                columns: {
                    name: true,
                }
            },
            messages: {
                orderBy: [desc(schema.messages.createdAt)],
                limit: 1,
            }
        },
        orderBy: [desc(schema.conversations.updatedAt)],
    });

    return conversations.map((conv) => ({
        id: conv.id,
        name: conv.firstName
            ? `${conv.firstName} ${conv.lastName || ""}`.trim()
            : conv.username || `User ${conv.telegramUserId}`,
        lastMessage: conv.messages[0]?.content || "Iniciou",
        timestamp: conv.messages[0]?.createdAt || conv.updatedAt,
        botName: conv.bot.name,
        botId: conv.botId,
        telegramUserId: conv.telegramUserId,
        tags: conv.tags || [],
        status: conv.status,
        isPaused: conv.isPaused,
        createdAt: conv.createdAt
    }));
}
