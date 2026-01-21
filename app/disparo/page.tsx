"use client";

import React from "react";
import { Zap, Send, Users, MessageSquare, Plus, Clock, BarChart3, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

const campaigns = [
    { id: 1, name: "Oferta de Verão", status: "Concluído", sent: 12450, open: "85%", date: "21 Jan, 2024" },
    { id: 2, name: "Lançamento Nova Onda", status: "Enviando", sent: 8302, open: "92%", date: "Em progresso" },
    { id: 3, name: "Recuperação de Carrinho", status: "Agendado", sent: 0, open: "-", date: "22 Jan, 2024" },
];

export default function DisparoPage() {
    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Disparo em Massa</h1>
                    <p className="text-sm text-[#555d66] font-medium">Comunicação em escala para sua base de clientes.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]">
                    <Plus size={18} />
                    Nova Campanha
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Enviado", value: "1.2M", icon: Send, color: "text-[#586ee0] bg-[#eef0ff]" },
                    { label: "Taxa de Abertura", value: "88%", icon: MessageSquare, color: "text-[#ff5100] bg-[#fff5f0]" },
                    { label: "Agendados", value: "14", icon: Clock, color: "text-[#ffb800] bg-[#fffcf0]" },
                    { label: "Lista de Leads", value: "45.8k", icon: Users, color: "text-emerald-500 bg-emerald-50" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4">
                        <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider mb-0.5">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-[#2d3339]">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Campaigns List */}
            <div className="glass-card bg-white border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-md font-bold text-[#2d3339]">Histórico de Campanhas</h3>
                    <button className="p-2 text-slate-400 hover:text-[#2d3339] transition-all">
                        <ListFilter size={18} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Campanha</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Sent</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Abertura</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest text-right">Métricas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaigns.map((camp) => (
                                <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-orange-50 text-[#ff5100] flex items-center justify-center">
                                                <Zap size={14} />
                                            </div>
                                            <span className="font-bold text-[#2d3339] text-sm">{camp.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={cn(
                                            "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            camp.status === "Concluído" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                camp.status === "Enviando" ? "bg-orange-50 text-[#ff5100] border border-orange-100 animate-pulse" :
                                                    "bg-slate-50 text-slate-400 border border-slate-100"
                                        )}>
                                            {camp.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-[#2d3339] text-sm">{camp.sent.toLocaleString()}</td>
                                    <td className="px-6 py-5 font-bold text-[#2d3339] text-sm">{camp.open}</td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-slate-300 hover:text-[#ff5100] transition-all">
                                            <BarChart3 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
