import { Worker, Job } from "bullmq";
import { redisConnection } from "./redis";
import { prisma } from "./prisma";
import { processMessage, startFlow } from "./flow-engine"; // We might need a modified version for automation

export const BROADCAST_QUEUE_NAME = "broadcast-queue";

export const broadcastWorker = new Worker(
    BROADCAST_QUEUE_NAME,
    async (job: Job) => {
        const { campaignId, telegramChatId, botId, flowId, messageText } = job.data;

        console.log(`[Worker] Processing job ${job.id} for campaign ${campaignId}`);

        try {
            // 1. Get Bot info
            const bot = await prisma.bot.findUnique({ where: { id: botId } });
            if (!bot) throw new Error("Bot not found");

            // 2. Either start a flow or send a raw message
            if (flowId) {
                // Direct execution for campaigns
                await startFlow(flowId, botId, telegramChatId);
            } else if (messageText) {
                // Send raw message
                await sendTelegramMessage(bot.token, telegramChatId, messageText);
            }

            // 3. Update Campaign Lead Status
            await prisma.campaignLead.update({
                where: { campaignId_telegramChatId: { campaignId, telegramChatId } },
                data: { status: "SENT", sentAt: new Date() }
            });

            // 4. Increment success count in Campaign
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { sentCount: { increment: 1 } }
            });

        } catch (error: any) {
            console.error(`[Worker] Failed to process job ${job.id}:`, error);

            // Update Lead with error
            await prisma.campaignLead.update({
                where: { campaignId_telegramChatId: { campaignId, telegramChatId } },
                data: { status: "FAILED", error: error.message }
            });

            // Increment fail count
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { failedCount: { increment: 1 } }
            });

            throw error; // Rethrow so BullMQ knows it failed
        }
    },
    {
        connection: redisConnection as any,
        concurrency: 5, // Process 5 messages at a time
        limiter: {
            max: 30,
            duration: 1000, // 30 messages per second (Telegram limit)
        },
    }
);

async function sendTelegramMessage(token: string, chatId: string, text: string) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Telegram API Error: ${err}`);
    }
}

broadcastWorker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed!`);
});

broadcastWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});
