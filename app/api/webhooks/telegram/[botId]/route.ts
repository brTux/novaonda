import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;

        // 1. Validate Bot
        const bot = await prisma.bot.findUnique({
            where: { id: botId },
        });

        if (!bot) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404 });
        }

        // 2. Parse Telegram Update
        const update = await request.json();

        // We only care about messages for now
        const message = update.message;
        if (!message) {
            return NextResponse.json({ ok: true }); // Acknowledge other updates (edited_message, etc.)
        }

        const chatId = message.chat.id.toString();
        const telegramUserId = message.from.id.toString();
        const text = message.text || (message.caption ? message.caption : "[Mídia]");
        const firstName = message.from.first_name || "";
        const lastName = message.from.last_name || "";
        const username = message.from.username || "";

        // 3. Find or Create Conversation
        const conversation = await prisma.conversation.upsert({
            where: {
                botId_telegramChatId: {
                    botId: bot.id,
                    telegramChatId: chatId,
                },
            },
            update: {
                updatedAt: new Date(),
                firstName, // Update user info in case they changed it
                lastName,
                username,
            },
            create: {
                botId: bot.id,
                telegramChatId: chatId,
                telegramUserId,
                firstName,
                lastName,
                username,
                status: "OPEN",
            },
        });

        // 4. Save Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: text,
                type: "TEXT", // Simplified for now, will handle media later
                sender: "USER",
            },
        });

        // TODO: Trigger Flow Engine here

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
