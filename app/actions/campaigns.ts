"use server";

import { prisma } from "@/lib/prisma";
import { addBroadcastJob } from "@/lib/queue";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCampaign(data: {
    name: string;
    flowId?: string;
    messageText?: string;
    botId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // 1. Create Campaign entry
    const campaign = await prisma.campaign.create({
        data: {
            name: data.name,
            flowId: data.flowId,
            userId: session.user.id,
            status: "DRAFT",
        }
    });

    // 2. Identify target leads (all conversations for this bot or all)
    const leads = await prisma.conversation.findMany({
        where: data.botId ? { botId: data.botId } : {},
        select: { telegramChatId: true, botId: true }
    });

    // 3. Create CampaignLead entries
    await prisma.campaignLead.createMany({
        data: leads.map((lead: any) => ({
            campaignId: campaign.id,
            telegramChatId: lead.telegramChatId,
            status: "PENDING"
        }))
    });

    // 4. Update campaign total
    await prisma.campaign.update({
        where: { id: campaign.id },
        data: { totalLeads: leads.length, botId: data.botId }
    });

    revalidatePath("/disparo");
    return { success: true, campaignId: campaign.id };
}

export async function startCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { leads: { where: { status: "PENDING" } } }
    });

    if (!campaign || !campaign.botId) throw new Error("Campaign or Bot not found");

    // Update status to RUNNING (using as Active)
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "RUNNING" }
    });

    // Add jobs to queue
    for (const lead of campaign.leads) {
        await addBroadcastJob({
            campaignId: campaign.id,
            telegramChatId: lead.telegramChatId,
            botId: campaign.botId,
            flowId: campaign.flowId || undefined,
        });
    }

    revalidatePath("/disparo");
    return { success: true };
}

export async function getCampaigns() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.campaign.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { leads: true }
            }
        }
    });
}
