import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getLeads } from "@/app/actions/chat";
import { getTags } from "@/app/actions/tags";
import { LeadsTable } from "@/components/leads/LeadsTable";

export default async function LeadsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Fetch initial data
    const [leads, bots, tags] = await Promise.all([
        getLeads({}),
        prisma.bot.findMany({
            where: { userId: session.user.id },
            select: { id: true, name: true }
        }),
        getTags()
    ]);

    return (
        <div className="h-full overflow-hidden flex flex-col bg-[#f8fafc] animate-in fade-in duration-500">
            <div className="p-6 md:p-10 flex flex-col gap-1 shrink-0">
                <h1 className="text-2xl font-bold text-[#2d3339]">Gerenciamento de Leads</h1>
                <p className="text-sm text-[#555d66] font-medium">Visualize e gerencie todos os contatos captados pelos seus robôs.</p>
            </div>

            <div className="flex-1 overflow-hidden px-6 md:px-10 pb-10">
                <LeadsTable initialLeads={leads} bots={bots} availableTags={tags} />
            </div>
        </div>
    );
}
