"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getDashboardStats() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Core Metrics & Activity
    const [totalLeads, totalMessages, totalBots, activeBots, totalRevenueResult, totalSales] = await Promise.all([
        prisma.leadTracking.count(),
        prisma.message.count({ where: { conversation: { bot: { userId } } } }),
        prisma.bot.count({ where: { userId } }),
        prisma.bot.count({ where: { userId, status: "ACTIVE" } }),
        prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID', conversation: { bot: { userId } } }
        }),
        prisma.transaction.count({
            where: { status: 'PAID', conversation: { bot: { userId } } }
        })
    ]);

    const totalRevenue = (totalRevenueResult._sum.amount || 0) / 100;

    // 2. Recent Activity
    const recentLeads = await prisma.leadTracking.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
    });

    const recentPayments = await prisma.transaction.findMany({
        where: { status: 'PAID', conversation: { bot: { userId } } },
        take: 3,
        orderBy: { paidAt: "desc" },
        include: { conversation: true }
    });

    const combinedActivity = [
        ...recentLeads.map(l => ({
            id: l.id,
            title: "Novo lead rastreado",
            description: `${l.city || "Localização desconhecida"} • ${l.utmSource || "Direto"}`,
            time: format(l.createdAt, "HH:mm"),
            date: format(l.createdAt, "dd/MM"),
            type: 'LEAD',
            rawDate: l.createdAt
        })),
        ...recentPayments.map(p => ({
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

        const [dayLeads, dayRevenue] = await Promise.all([
            prisma.leadTracking.count({
                where: { createdAt: { gte: dayStart, lt: nextDay } }
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    paidAt: { gte: dayStart, lt: nextDay },
                    conversation: { bot: { userId } }
                }
            })
        ]);

        chartData.push({
            name: format(date, "EEE", { locale: ptBR }),
            leads: dayLeads,
            revenue: (dayRevenue._sum.amount || 0) / 100,
        });
    }

    const conversionRate = totalLeads > 0 ? (totalSales / totalLeads * 100).toFixed(1) + "%" : "0%";

    return {
        stats: {
            totalLeads,
            totalMessages,
            totalRevenue: `R$ ${totalRevenue.toFixed(2)}`,
            performance: conversionRate,
            activeBots,
        },
        recentActivity: combinedActivity,
        chartData
    };
}
