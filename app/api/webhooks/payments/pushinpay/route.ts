import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("[PushinPay Webhook] Received payload:", payload);

        const { id: externalId, status, value } = payload;

        if (!status) {
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        // 1. Find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { externalId },
            include: { conversation: { include: { bot: true } } }
        });

        if (!transaction) {
            console.warn(`[PushinPay Webhook] Transaction not found: ${externalId}`);
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // 2. Update status
        const newStatus = status === 'paid' ? 'PAID' : transaction.status;

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus as any,
                paidAt: status === 'paid' ? new Date() : undefined
            }
        });

        console.log(`[PushinPay Webhook] Updated transaction ${externalId} to ${newStatus}`);

        // 3. Optional: Trigger automation or notification to the user in Telegram
        if (status === 'paid') {
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
        console.error("[PushinPay Webhook] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
