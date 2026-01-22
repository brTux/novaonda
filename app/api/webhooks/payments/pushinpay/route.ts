import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleTagTrigger } from "@/lib/flow-engine";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("[PushinPay Webhook] Received payload:", JSON.stringify(payload, null, 2));

        const { id, status, value } = payload;
        const externalId = id?.toString();

        if (!status) {
            console.error("[PushinPay Webhook] Missing status in payload");
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        // 1. Find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { externalId },
            include: { conversation: { include: { bot: true } } }
        });

        if (!transaction) {
            console.warn(`[PushinPay Webhook] Transaction not found for externalId: ${externalId}`);
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. Update status mapping (robust check)
        const isPaid = status.toLowerCase() === 'paid';
        const newStatus = isPaid ? 'PAID' : transaction.status;

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus as any,
                paidAt: isPaid ? new Date() : undefined
            }
        });

        console.log(`[PushinPay Webhook] Updated transaction ${externalId} (DB ID: ${transaction.id}) to ${newStatus}`);

        // 3. Trigger automation
        if (isPaid) {
            const bot = transaction.conversation.bot;
            const chatId = transaction.conversation.telegramChatId;

            // Apply paidTag if it exists
            if (transaction.paidTag) {
                console.log(`[PushinPay Webhook] Applying tag '${transaction.paidTag}' to conversation ${transaction.conversationId}`);

                const currentTags = transaction.conversation.tags || [];
                if (!currentTags.includes(transaction.paidTag)) {
                    await prisma.conversation.update({
                        where: { id: transaction.conversationId },
                        data: {
                            tags: {
                                set: [...currentTags, transaction.paidTag]
                            }
                        }
                    });

                    // TRIGGER FLOW BY TAG!
                    console.log(`[PushinPay Webhook] Triggering flow for tag: ${transaction.paidTag}`);
                    await handleTagTrigger(bot.id, chatId, transaction.paidTag);
                }
            }

            await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `✅ *Pagamento Confirmado!*\n\nRecebemos seu Pix de R$ ${(transaction.amount / 100).toFixed(2)}. Obrigado!`,
                    parse_mode: 'Markdown'
                })
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PushinPay Webhook] Critical Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
