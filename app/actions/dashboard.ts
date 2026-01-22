"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getDashboardStats() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Core Metrics
    const [totalLeads, totalMessages, totalBots, activeBots] = await Promise.all([
        prisma.leadTracking.count(), // Lead tracking is global for now, but usually we'd filter by user's pressells
        prisma.message.count({
            where: {
                conversation: {
                    bot: { userId }
                }
            }
        }),
        prisma.bot.count({ where: { userId } }),
        prisma.bot.count({ where: { userId, status: "ACTIVE" } })
    ]);

    // 2. Recent Activity (Last 5 leads or messages)
    const recentActivity = await prisma.leadTracking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
    });

    // 3. Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const nextDay = startOfDay(subDays(date, -1));

        const dayLeads = await prisma.leadTracking.count({
            where: {
                createdAt: {
                    gte: dayStart,
                    lt: nextDay,
                }
            }
        });

        // We could also count messages or sales if we had them
        chartData.push({
            name: format(date, "EEE", { locale: ptBR }),
            leads: dayLeads,
            messages: Math.floor(dayLeads * 1.5), // Dummy multiplier for now until we have more real data
        });
    }

    return {
        stats: {
            totalLeads,
            totalMessages,
            performance: totalBots > 0 ? (activeBots / totalBots * 100).toFixed(1) + "%" : "0%",
            activeBots,
        },
        recentActivity: recentActivity.map(item => ({
            id: item.id,
            title: "Novo lead rastreado",
            description: `${item.city || "Localização desconhecida"} • ${item.utmSource || "Direto"}`,
            time: format(item.createdAt, "HH:mm"),
            date: format(item.createdAt, "dd/MM")
        })),
        chartData
    };
}
