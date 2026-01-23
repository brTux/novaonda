"use server";

import { db } from "@/lib/db";
import * as schema from "@/db/schema";
import { auth } from "@/auth";
import { startOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { eq, and, gte, lt, sql, desc } from "drizzle-orm";

export async function getDashboardStats() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Core Metrics
    const [totalLeadsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.conversations)
        .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
        .where(eq(schema.bots.userId, userId));

    const [activeBotsResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.bots)
        .where(and(eq(schema.bots.userId, userId), eq(schema.bots.status, "ACTIVE")));

    const [revenueResult] = await db
        .select({ sum: sql<number>`sum(${schema.transactions.amount})` })
        .from(schema.transactions)
        .innerJoin(schema.conversations, eq(schema.transactions.conversationId, schema.conversations.id))
        .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
        .where(and(eq(schema.bots.userId, userId), eq(schema.transactions.status, 'PAID')));

    const [pixGeneratedResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.transactions)
        .innerJoin(schema.conversations, eq(schema.transactions.conversationId, schema.conversations.id))
        .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
        .where(eq(schema.bots.userId, userId));

    const [pixPaidResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.transactions)
        .innerJoin(schema.conversations, eq(schema.transactions.conversationId, schema.conversations.id))
        .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
        .where(and(eq(schema.bots.userId, userId), eq(schema.transactions.status, 'PAID')));

    const totalLeads = Number(totalLeadsResult?.count || 0);
    const totalRevenue = Number(revenueResult?.sum || 0) / 100;
    const pixGenerated = Number(pixGeneratedResult?.count || 0);
    const pixPaid = Number(pixPaidResult?.count || 0);
    const activeBots = Number(activeBotsResult?.count || 0);

    // 2. Recent Activity
    const recentLeads = await db.query.conversations.findMany({
        where: sql`${schema.conversations.botId} IN (SELECT id FROM bots WHERE "userId" = ${userId})`,
        limit: 3,
        orderBy: [desc(schema.conversations.createdAt)],
    });

    const recentPayments = await db.query.transactions.findMany({
        where: and(
            eq(schema.transactions.status, 'PAID'),
            sql`${schema.transactions.conversationId} IN (SELECT id FROM conversations WHERE "botId" IN (SELECT id FROM bots WHERE "userId" = ${userId}))`
        ),
        limit: 3,
        orderBy: [desc(schema.transactions.paidAt)],
        with: {
            conversation: true
        }
    });

    const combinedActivity = [
        ...recentLeads.map((l: any) => ({
            id: l.id,
            title: "Novo lead interagiu",
            description: `${l.firstName || "Cliente"} • ${l.username || "Telegram"}`,
            time: format(l.createdAt, "HH:mm"),
            date: format(l.createdAt, "dd/MM"),
            type: 'LEAD',
            rawDate: l.createdAt
        })),
        ...recentPayments.map((p: any) => ({
            id: p.id,
            title: "Pagamento confirmado!",
            description: `R$ ${(p.amount / 100).toFixed(2)} • ${p.conversation.firstName || 'Cliente'}`,
            time: format(p.paidAt || p.updatedAt, "HH:mm"),
            date: format(p.paidAt || p.updatedAt, "dd/MM"),
            type: 'SALE',
            rawDate: p.paidAt || p.updatedAt
        }))
    ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5);

    // 3. Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const nextDay = startOfDay(subDays(date, -1));

        const [dayLeadsRes] = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.conversations)
            .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
            .where(and(
                eq(schema.bots.userId, userId),
                gte(schema.conversations.createdAt, dayStart),
                lt(schema.conversations.createdAt, nextDay)
            ));

        const [dayRevenueRes] = await db
            .select({ sum: sql<number>`sum(${schema.transactions.amount})` })
            .from(schema.transactions)
            .innerJoin(schema.conversations, eq(schema.transactions.conversationId, schema.conversations.id))
            .innerJoin(schema.bots, eq(schema.conversations.botId, schema.bots.id))
            .where(and(
                eq(schema.bots.userId, userId),
                eq(schema.transactions.status, 'PAID'),
                gte(schema.transactions.paidAt, dayStart),
                lt(schema.transactions.paidAt, nextDay)
            ));

        chartData.push({
            name: format(date, "EEE", { locale: ptBR }),
            leads: Number(dayLeadsRes?.count || 0),
            revenue: Number(dayRevenueRes?.sum || 0) / 100,
        });
    }

    // 4. Advanced Metrics
    const conversionRate = totalLeads > 0 ? ((pixPaid / totalLeads) * 100).toFixed(1) + "%" : "0%";
    const averageTicket = pixPaid > 0 ? (totalRevenue / pixPaid) : 0;
    const paymentEfficiency = pixGenerated > 0 ? ((pixPaid / pixGenerated) * 100).toFixed(1) + "%" : "0%";

    return {
        stats: {
            totalLeads,
            totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            salesGenerated: pixGenerated,
            salesPaid: pixPaid,
            pixGenerated,
            pixPaid,
            conversionRate,
            activeBots,
            averageTicket: `R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            paymentEfficiency,
        },
        recentActivity: combinedActivity,
        chartData
    };
}
