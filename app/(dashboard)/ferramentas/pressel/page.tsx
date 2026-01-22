import React from "react";
import { Plus, Rocket, Globe, ExternalLink, MousePointer2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getBots } from "@/app/actions/bots";
import PressellList from "@/components/marketing/PressellList";

export default async function PressellPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [pressells, bots] = await Promise.all([
        prisma.pressell.findMany({
            where: { userId: session.user.id },
            include: { bot: true },
            orderBy: { createdAt: "desc" }
        }),
        getBots()
    ]);

    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Gerador de Pressell</h1>
                    <p className="text-sm text-[#555d66] font-medium">Crie landing pages de alta conversão para seus anúncios.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#ff5100] flex items-center justify-center">
                        <Rocket size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#2d3339]">Alta Conversão</h3>
                        <p className="text-xs text-[#555d66]">Templates otimizados para carregar em menos de 1 segundo no mobile.</p>
                    </div>
                </div>
                <div className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#2d3339]">Rastreamento Total</h3>
                        <p className="text-xs text-[#555d66]">Meta Pixel, UTMs e Geolocalização inclusos nativamente.</p>
                    </div>
                </div>
                <div className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <MousePointer2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#2d3339]">Pronto para Ads</h3>
                        <p className="text-xs text-[#555d66]">Evite bloqueios no Facebook/Google eliminando redirecionamentos diretos.</p>
                    </div>
                </div>
            </div>

            <PressellList
                initialPressells={JSON.parse(JSON.stringify(pressells))}
                bots={JSON.parse(JSON.stringify(bots))}
            />
        </div>
    );
}
