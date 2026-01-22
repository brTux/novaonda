"use client";
import React, { useState } from "react";
import { Search, Filter, Trash2, MessageCircle, Bot, Tag, Calendar, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { deleteConversation, getLeads } from "@/app/actions/chat";
import Link from "next/link";

interface LeadsTableProps {
    initialLeads: any[];
    bots: any[];
}

export function LeadsTable({ initialLeads, bots }: LeadsTableProps) {
    const [leads, setLeads] = useState(initialLeads);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedBot, setSelectedBot] = useState("");

    const handleFilter = async () => {
        setIsLoading(true);
        const filteredLeads = await getLeads({
            search: search || undefined,
            botId: selectedBot || undefined
        });
        setLeads(filteredLeads);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja apagar este lead? Esta ação é irreversível.")) return;

        const result = await deleteConversation(id);
        if (result.success) {
            setLeads(leads.filter(l => l.id !== id));
        } else {
            alert("Erro ao apagar lead.");
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-4 bg-slate-50/50">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, usuário ou ID..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 ring-orange-100 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 ring-orange-100 shadow-sm"
                        value={selectedBot}
                        onChange={(e) => setSelectedBot(e.target.value)}
                    >
                        <option value="">Todos os Robôs</option>
                        {bots.map((bot) => (
                            <option key={bot.id} value={bot.id}>{bot.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleFilter}
                        disabled={isLoading}
                        className="bg-orange-600 text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? "Buscando..." : <><Filter size={16} /> Filtrar</>}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Lead</th>
                            <th className="px-6 py-4">Robô</th>
                            <th className="px-6 py-4">Etiquetas</th>
                            <th className="px-6 py-4">Última Atividade</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                                    Nenhum lead encontrado.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{lead.name}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">@{lead.telegramUserId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg w-fit text-xs font-bold border border-blue-100">
                                            <Bot size={12} />
                                            {lead.botName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {lead.tags.length > 0 ? (
                                                lead.tags.map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold border border-slate-200">
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-slate-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[11px] text-slate-500 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} className="text-slate-400" />
                                                {format(new Date(lead.timestamp), "dd/MM/yyyy", { locale: ptBR })}
                                            </span>
                                            <span>{format(new Date(lead.timestamp), "HH:mm")}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[10px] font-extrabold uppercase",
                                            lead.isPaused
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                        )}>
                                            {lead.isPaused ? "Pausado" : "Ativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                href={`/chat?id=${lead.id}`}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Abrir Chat"
                                            >
                                                <MessageCircle size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Apagar Lead"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Selected Count / Info Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                <span>Total de {leads.length} Leads</span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Bot Ativo
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Pausado (Manual)
                    </span>
                </div>
            </div>
        </div>
    );
}
