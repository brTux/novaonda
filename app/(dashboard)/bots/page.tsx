"use client";

import React from "react";
import { Plus, Bot, Settings, Power, Signal, ExternalLink } from "lucide-react";

const bots = [
    { id: 1, name: "Vendas Oficial", status: "Online", users: 1245, flows: 8, lastActive: "Agora" },
    { id: 2, name: "Suporte Técnico", status: "Offline", users: 802, flows: 3, lastActive: "2h atrás" },
    { id: 3, name: "Bot Recuperação", status: "Online", users: 3450, flows: 12, lastActive: "Há 1 min" },
];

export default function BotsPage() {
    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Seus Robôs</h1>
                    <p className="text-sm text-[#555d66] font-medium">Conecte e automatize o atendimento no Telegram.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:bg-[#e64a00] hover:scale-[1.02] active:scale-95 shadow-[#ff5100]/10">
                    <Plus size={18} />
                    Conectar Novo Bot
                </button>
            </div>

            {/* Bots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                    <div key={bot.id} className="glass-card bg-white p-6 rounded-xl flex flex-col gap-6 relative group overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100]">
                                <Bot size={24} />
                            </div>
                            <div className={bot.status === "Online" ? "flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-wider" : "flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider"}>
                                <Signal size={12} className={bot.status === "Online" ? "animate-pulse" : ""} />
                                {bot.status}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-[#2d3339]">{bot.name}</h3>
                            <p className="text-[11px] text-[#555d66] font-medium italic">Último sinal: {bot.lastActive}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-[#555d66] uppercase mb-0.5">Leads</p>
                                <p className="text-lg font-bold text-[#2d3339]">{bot.users.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[9px] font-bold text-[#555d66] uppercase mb-0.5">Fluxos</p>
                                <p className="text-lg font-bold text-[#2d3339]">{bot.flows}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-auto">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-[#2d3339] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200">
                                <Settings size={16} />
                                Ajustes
                            </button>
                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-[#df2020] hover:bg-red-50 transition-all border border-slate-100">
                                <Power size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

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
