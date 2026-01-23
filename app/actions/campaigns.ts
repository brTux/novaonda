"use server";

import { db } from "@/lib/db";
import { addBroadcastJob } from "@/lib/queue";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as schema from "@/db/schema";
import { eq, inArray, and, sql, count, desc } from "drizzle-orm";

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
    const campaignResult = await db.insert(schema.campaigns).values({
        name: data.name,
        flowId: data.flowId || null,
        userId: session.user.id,
        status: "DRAFT",
    }).returning();
    const campaign = campaignResult[0];

    // 2. Identify target leads
    let conditions = [];

    // Security: ensure conv.bot.userId == session.user.id
    conditions.push(
        (conversations: any, { exists }: any) => exists(
            db.select().from(schema.bots)
                .where(and(
                    eq(schema.bots.id, schema.conversations.botId),
                    eq(schema.bots.userId, session.user.id!)
                ))
        )
    );

    if (!data.targetAllBots && data.botIds && data.botIds.length > 0) {
        conditions.push(inArray(schema.conversations.botId, data.botIds));
    }

    if (data.includeTags && data.includeTags.length > 0) {
        // Postgres array overlap operator &&
        conditions.push(sql`${schema.conversations.tags} && ${data.includeTags}`);
    }

    if (data.excludeTags && data.excludeTags.length > 0) {
        // NOT (tags && excludeTags)
        conditions.push(sql`NOT (${schema.conversations.tags} && ${data.excludeTags})`);
    }

    const leads = await db.select({
        telegramChatId: schema.conversations.telegramChatId,
        botId: schema.conversations.botId
    }).from(schema.conversations)
        .where(and(...conditions as any));

    // 3. Create CampaignLead entries (Deduplicate by telegramChatId)
    const uniqueLeadsMap = new Map();
    leads.forEach(l => {
        if (!uniqueLeadsMap.has(l.telegramChatId)) {
            uniqueLeadsMap.set(l.telegramChatId, l);
        }
    });
    const uniqueLeads = Array.from(uniqueLeadsMap.values());

    if (uniqueLeads.length > 0) {
        // Chunk inserts if too many leads to avoid query size limits
        const chunkSize = 1000;
        for (let i = 0; i < uniqueLeads.length; i += chunkSize) {
            const chunk = uniqueLeads.slice(i, i + chunkSize);
            await db.insert(schema.campaignLeads).values(
                chunk.map((lead: any) => ({
                    campaignId: campaign.id,
                    telegramChatId: lead.telegramChatId,
                    botId: lead.botId,
                    status: "PENDING"
                }))
            ).onConflictDoNothing(); // Safety
        }
    }

    // 4. Update campaign total
    await db.update(schema.campaigns)
        .set({
            totalLeads: uniqueLeads.length,
            botId: (!data.targetAllBots && data.botIds?.length === 1) ? data.botIds[0] : null
        })
        .where(eq(schema.campaigns.id, campaign.id));

    revalidatePath("/disparo");
    return { success: true, campaignId: campaign.id };
}

export async function startCampaign(campaignId: string) {
    const campaign = await db.query.campaigns.findFirst({
        where: eq(schema.campaigns.id, campaignId),
        with: {
            leads: {
                where: eq(schema.campaignLeads.status, "PENDING"),
                with: { bot: true }
            }
        }
    });

    if (!campaign) throw new Error("Campaign not found");

    // Update status to RUNNING
    await db.update(schema.campaigns)
        .set({ status: "RUNNING" })
        .where(eq(schema.campaigns.id, campaignId));

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

    // Fetch campaigns with lead counts
    // Using simple query + map for now, or raw sql for count
    // Drizzle relations don't support _count property natively without extras

    // Efficient approach: Select campaigns and a subquery/join for count?
    // Or just fetch all and map async count? (N+1 prob)
    // Best Drizzle way:

    const rows = await db.select({
        campaign: schema.campaigns,
        leadsCount: count(schema.campaignLeads.id)
    })
        .from(schema.campaigns)
        .leftJoin(schema.campaignLeads, eq(schema.campaigns.id, schema.campaignLeads.campaignId))
        .where(eq(schema.campaigns.userId, session.user.id))
        .groupBy(schema.campaigns.id)
        .orderBy(desc(schema.campaigns.createdAt));

    return rows.map(r => ({
        ...r.campaign,
        _count: { leads: r.leadsCount }
    }));
}
