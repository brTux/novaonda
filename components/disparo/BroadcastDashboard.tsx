"use client";

import React, { useState } from "react";
import { Zap, Send, Users, MessageSquare, Plus, Clock, BarChart3, ListFilter, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import NewCampaignModal from "./NewCampaignModal";
import { startCampaign } from "@/app/actions/campaigns";

interface BroadcastDashboardProps {
    campaigns: any[];
    bots: any[];
    flows: any[];
}

export default function BroadcastDashboard({ campaigns: initialCampaigns, bots, flows }: BroadcastDashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [startingId, setStartingId] = useState<string | null>(null);

    async function handleStartCampaign(id: string) {
        setStartingId(id);
        try {
            await startCampaign(id);
            // Refresh local state (simplified)
            setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "RUNNING" } : c));
        } catch (err) {
            alert("Erro ao iniciar campanha: " + err);
        } finally {
            setStartingId(null);
        }
    }

    const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const totalLeads = campaigns.reduce((acc, c) => acc + (c.totalLeads || 0), 0);

    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Disparo em Massa</h1>
                    <p className="text-sm text-[#555d66] font-medium">Comunicação em escala para sua base de clientes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]"
                >
                    <Plus size={18} />
                    Nova Campanha
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Enviado", value: totalSent.toLocaleString(), icon: Send, color: "text-[#586ee0] bg-[#eef0ff]" },
                    { label: "Taxa de Sucesso", value: totalSent > 0 ? `${Math.round((totalSent / totalLeads) * 100)}%` : "0%", icon: MessageSquare, color: "text-[#ff5100] bg-[#fff5f0]" },
                    { label: "Campanhas", value: campaigns.length.toString(), icon: Clock, color: "text-[#ffb800] bg-[#fffcf0]" },
                    { label: "Total de Leads", value: totalLeads.toLocaleString(), icon: Users, color: "text-emerald-500 bg-emerald-50" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
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
            <div className="glass-card bg-white border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-md font-bold text-[#2d3339]">Histórico de Campanhas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Campanha</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Progresso</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Data</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-[#555d66] uppercase tracking-widest text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm font-medium">Nenhuma campanha criada ainda.</td>
                                </tr>
                            ) : campaigns.map((camp) => (
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
                                            camp.status === "RUNNING" ? "bg-emerald-50 text-emerald-600 border border-emerald-100 animate-pulse" :
                                                camp.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    "bg-slate-50 text-slate-400 border border-slate-100"
                                        )}>
                                            {camp.status === "RUNNING" ? "Enviando" : camp.status === "DRAFT" ? "Rascunho" : "Concluído"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                                            <div className="flex items-center justify-between text-[10px] font-bold">
                                                <span className="text-[#555d66]">{camp.sentCount} / {camp.totalLeads}</span>
                                                <span className="text-[#ff5100]">{Math.round((camp.sentCount / camp.totalLeads) * 100 || 0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#ff5100] transition-all duration-500"
                                                    style={{ width: `${(camp.sentCount / camp.totalLeads) * 100 || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-slate-400 text-xs">
                                        {new Date(camp.createdAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {camp.status === "DRAFT" ? (
                                            <button
                                                onClick={() => handleStartCampaign(camp.id)}
                                                disabled={startingId === camp.id}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all shadow-sm disabled:opacity-50"
                                                title="Iniciar Disparo"
                                            >
                                                {startingId === camp.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                                            </button>
                                        ) : (
                                            <button className="p-2 text-slate-300 hover:text-[#ff5100] transition-all" title="Ver Detalhes">
                                                <BarChart3 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <NewCampaignModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bots={bots}
                flows={flows}
            />
        </div>
    );
}
