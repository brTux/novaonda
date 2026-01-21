"use client";

import { Bot, Signal, Settings, Trash2 } from "lucide-react";
import { deleteBot } from "@/app/actions/bots";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface BotListProps {
    bots: any[];
}

export function BotList({ bots }: BotListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja desconectar este bot?")) return;

        setDeletingId(id);
        await deleteBot(id);
        setDeletingId(null);
        // Page cleans up due to revalidatePath, but router.refresh helps ensures client state sync
        router.refresh();
    };

    if (bots.length === 0) {
        return (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Bot size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#2d3339]">Nenhum bot conectado</h3>
                <p className="text-sm text-[#555d66] max-w-xs mt-1">Conecte seu primeiro bot do Telegram agora mesmo para começar a automatizar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
                <div key={bot.id} className="glass-card bg-white p-6 rounded-xl flex flex-col gap-6 relative group overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100]">
                            <Bot size={24} />
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                            <Signal size={12} className="animate-pulse" />
                            Online
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-[#2d3339]">{bot.name}</h3>
                        <p className="text-[11px] text-[#555d66] font-medium italic">@{bot.username}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-[#555d66] uppercase mb-0.5">Leads</p>
                            <p className="text-lg font-bold text-[#2d3339]">0</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-[#555d66] uppercase mb-0.5">Fluxos</p>
                            <p className="text-lg font-bold text-[#2d3339]">0</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-[#2d3339] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200">
                            <Settings size={16} />
                            Configurar
                        </button>
                        <button
                            onClick={() => handleDelete(bot.id)}
                            disabled={deletingId === bot.id}
                            className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-[#df2020] hover:bg-red-50 transition-all border border-slate-100 disabled:opacity-50"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
