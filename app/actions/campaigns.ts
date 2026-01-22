"use server";

import { prisma } from "@/lib/prisma";
import { addBroadcastJob } from "@/lib/queue";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createCampaign(data: {
    name: string;
    flowId?: string;
    messageText?: string;
    botIds?: string[]; // Multiple bots
    includeTags?: string[];
    excludeTags?: string[];
    targetAllBots?: boolean;
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

    // 2. Identify target leads
    const where: any = {
        bot: {
            userId: session.user.id, // Security: only user's bots
        }
    };

    if (!data.targetAllBots && data.botIds && data.botIds.length > 0) {
        where.botId = { in: data.botIds };
    }

    if (data.includeTags && data.includeTags.length > 0) {
        where.tags = { hasSome: data.includeTags };
    }

    if (data.excludeTags && data.excludeTags.length > 0) {
        // Prisma doesn't have a direct "not hasSome", we use NOT with hasSome
        where.NOT = {
            tags: { hasSome: data.excludeTags }
        };
    }

    const leads = await prisma.conversation.findMany({
        where,
        select: { telegramChatId: true, botId: true }
    });

    // 3. Create CampaignLead entries (Deduplicate by telegramChatId)
    const uniqueLeadsMap = new Map();
    leads.forEach(l => {
        if (!uniqueLeadsMap.has(l.telegramChatId)) {
            uniqueLeadsMap.set(l.telegramChatId, l);
        }
    });
    const uniqueLeads = Array.from(uniqueLeadsMap.values());

    await prisma.campaignLead.createMany({
        data: uniqueLeads.map((lead: any) => ({
            campaignId: campaign.id,
            telegramChatId: lead.telegramChatId,
            botId: lead.botId,
            status: "PENDING"
        }))
    });

    // 4. Update campaign total
    await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
            totalLeads: uniqueLeads.length,
            // If it's a single bot campaign, we can still set botId for compatibility
            botId: (!data.targetAllBots && data.botIds?.length === 1) ? data.botIds[0] : null
        }
    });

    revalidatePath("/disparo");
    return { success: true, campaignId: campaign.id };
}

export async function startCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            leads: {
                where: { status: "PENDING" },
                include: { bot: true } // Need bot token!
            }
        }
    });

    if (!campaign) throw new Error("Campaign not found");

    // Update status to RUNNING
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "RUNNING" }
    });

    // Add jobs to queue
    for (const lead of campaign.leads) {
        if (!lead.botId) continue;

        await addBroadcastJob({
            campaignId: campaign.id,
            telegramChatId: lead.telegramChatId,
            botId: lead.botId,
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
