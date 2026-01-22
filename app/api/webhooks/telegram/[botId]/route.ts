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
        let trackingData: any = {};
        if (text.startsWith("/start tr_")) {
            const trackingId = text.split(" ")[1].replace("tr_", "");
            const tracking = await prisma.leadTracking.findUnique({
                where: { id: trackingId }
            });

            if (tracking) {
                trackingData = {
                    ip: tracking.ip,
                    city: tracking.city,
                    state: tracking.state,
                    latitude: tracking.latitude,
                    longitude: tracking.longitude,
                    utmSource: tracking.utmSource,
                    utmMedium: tracking.utmMedium,
                    utmCampaign: tracking.utmCampaign,
                    utmContent: tracking.utmContent,
                    utmTerm: tracking.utmTerm,
                };
            }
        }

        const conversation = await prisma.conversation.upsert({
            where: {
                botId_telegramChatId: {
                    botId: bot.id,
                    telegramChatId: chatId,
                },
            },
            update: {
                updatedAt: new Date(),
                firstName,
                lastName,
                username,
                // Only update tracking data if we actually have new data
                ...(Object.keys(trackingData).length > 0 ? trackingData : {})
            },
            create: {
                botId: bot.id,
                telegramChatId: chatId,
                telegramUserId,
                firstName,
                lastName,
                username,
                status: "OPEN",
                ...trackingData
            },
        });

        // 4. Save Message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: text,
                type: "TEXT",
                sender: "USER",
            },
        });

        // 5. Trigger Flow Engine (Fire and Forget)
        import("@/lib/flow-engine").then(engine => {
            engine.processMessage(bot.id, chatId, text).catch(err => {
                console.error("[Webhook] Flow Engine Error:", err);
            });
        });

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
