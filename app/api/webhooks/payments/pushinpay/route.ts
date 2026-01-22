import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleTagTrigger } from "@/lib/flow-engine";

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        const rawText = await request.text();
        console.log(`[PushinPay Webhook] Received raw body (Type: ${contentType}):`, rawText);

        let payload: any;
        try {
            payload = JSON.parse(rawText);
        } catch (e) {
            // Fallback to URL-Encoded parsing
            const params = new URLSearchParams(rawText);
            payload = Object.fromEntries(params.entries());
            console.log("[PushinPay Webhook] Parsed as Form-Encoded:", JSON.stringify(payload, null, 2));
        }

        // 1. Robust ID and Status extraction
        const data = payload.data || payload;
        const id = data.id || data.transaction_id || data.external_id || (data.pix_details?.id);
        const status = data.status;
        const externalId = id?.toString().toLowerCase();

        console.log(`[PushinPay Webhook] Extracted: externalId=${externalId}, status=${status}`);

        if (!status) {
            console.error("[PushinPay Webhook] ERROR: Missing status in payload");
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        if (!externalId) {
            console.error("[PushinPay Webhook] ERROR: Could not find transaction ID in payload");
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        // 2. Find the transaction
        const transaction = await prisma.transaction.findUnique({
            where: { externalId },
            include: { conversation: { include: { bot: true } } }
        });

        if (!transaction) {
            console.warn(`[PushinPay Webhook] WARNING: Transaction not found in DB for externalId: ${externalId}`);
            // Return 200 to acknowledge receipt even if not found, to stop retries if it's a dead transaction
            return NextResponse.json({ error: "Transaction not found", externalId }, { status: 200 });
        }

        // 3. Update status mapping
        const isPaid = status.toLowerCase() === 'paid';
        const newStatus = isPaid ? 'PAID' : transaction.status;

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                status: newStatus as any,
                paidAt: isPaid ? new Date() : undefined
            }
        });

        console.log(`[PushinPay Webhook] SUCCESS: Updated transaction ${externalId} (DB ID: ${transaction.id}) to ${newStatus}`);

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
