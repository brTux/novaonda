import React from "react";
import { ExternalLink } from "lucide-react";
import { getBots } from "@/app/actions/bots";
import { NewBotModal } from "@/components/bots/NewBotModal";
import { BotList } from "@/components/bots/BotList";

export default async function BotsPage() {
    const bots = await getBots();

    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Seus Robôs</h1>
                    <p className="text-sm text-[#555d66] font-medium">Conecte e automatize o atendimento no Telegram.</p>
                </div>
                <NewBotModal />
            </div>

            {/* Bots Grid */}
            <BotList bots={bots} />

            {/* API Banner - Hotmart Aesthetic */}
            <div className="bg-white border-2 border-slate-100 p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#ff5100]/10 flex items-center justify-center text-[#ff5100] shrink-0">
                    <ExternalLink size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-[#2d3339]">Conectividade API em Tempo Real</h2>
                    <p className="text-sm text-[#555d66] font-medium mt-1">Conecte seus bots via Webhook oficial para responder instantaneamente aos eventos.</p>
                </div>
                <button className="px-6 py-3 bg-[#ff5100] text-white rounded-xl font-bold text-sm shadow-md shadow-[#ff5100]/10 hover:bg-[#e64a00] transition-all">
                    Explorar Documentação
                </button>
            </div>
        </div>
    );
}
