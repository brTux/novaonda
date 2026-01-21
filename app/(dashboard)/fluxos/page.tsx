"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, MessageSquare, ArrowRight, Filter, MoreHorizontal } from "lucide-react";

const fluxos = [
    { id: 1, name: "Boas-vindas Loja", status: "Ativo", steps: 12, triggers: "Início", date: "Há 2 horas" },
    { id: 2, name: "Recuperação de Pix", status: "Pausado", steps: 5, triggers: "/pix", date: "Há 1 dia" },
    { id: 3, name: "Lead Quiz Pressel", status: "Ativo", steps: 24, triggers: "Anúncio", date: "Há 15 min" },
];

export default function FluxosPage() {
    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Automação de Fluxos</h1>
                    <p className="text-sm text-[#555d66] font-medium">Crie sequências inteligentes para vender mais.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:bg-[#e64a00] hover:scale-[1.02] active:scale-95 shadow-[#ff5100]/10">
                    <Plus size={18} />
                    Novo Fluxo
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar fluxos..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all"
                    />
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-[#555d66] hover:bg-slate-50 transition-all">
                    <Filter size={14} /> Filtros
                </button>
            </div>

            {/* Fluxos Grid */}
            <div className="grid grid-cols-1 gap-4">
                {fluxos.map((fluxo) => (
                    <div key={fluxo.id} className="glass-card bg-white p-6 rounded-xl group hover:border-[#ff5100]/20 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100]">
                                    <MessageSquare size={22} />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-md font-bold text-[#2d3339] truncate">{fluxo.name}</h3>
                                        <span className={fluxo.status === "Ativo" ? "px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-100" : "px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-100"}>
                                            {fluxo.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-[#555d66] mt-1 space-x-2">
                                        <span>{fluxo.steps} Blocos</span>
                                        <span className="text-slate-200">•</span>
                                        <span>Gatilho: {fluxo.triggers}</span>
                                        <span className="text-slate-200">•</span>
                                        <span className="opacity-70">{fluxo.date}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/fluxos/${fluxo.id}`}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#ff5100] text-white px-5 py-2.5 rounded-lg font-bold text-xs transition-all hover:bg-[#e64a00]"
                                >
                                    Editar Fluxo
                                    <ArrowRight size={14} />
                                </Link>
                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:text-[#2d3339] border border-slate-100">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
