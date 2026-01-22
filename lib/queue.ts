import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const BROADCAST_QUEUE_NAME = "broadcast-queue";

export const broadcastQueue = new Queue(BROADCAST_QUEUE_NAME, {
    connection: redisConnection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export async function addBroadcastJob(data: {
    campaignId: string;
    telegramChatId: string;
    botId: string;
    flowId?: string;
    messageText?: string;
}) {
    return await broadcastQueue.add("send-message", data);
}
