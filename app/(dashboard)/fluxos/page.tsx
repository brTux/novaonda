import React from "react";
import Link from "next/link";
import { Plus, Search, MessageSquare, ArrowRight, Filter, MoreHorizontal } from "lucide-react";
import { getFlows } from "@/app/actions/flows";
import { getBots } from "@/app/actions/bots";
import { NewFlowModal } from "@/components/fluxos/NewFlowModal";
import { ImportFlowModal } from "@/components/fluxos/ImportFlowModal";
import { FlowMenu } from "@/components/fluxos/FlowMenu";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function FluxosPage() {
    const [flows, bots] = await Promise.all([
        getFlows(),
        getBots()
    ]);

    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#2d3339]">Automação de Fluxos</h1>
                    <p className="text-sm text-[#555d66] font-medium">Crie sequências inteligentes para vender mais.</p>
                </div>
                <div className="flex items-center gap-3">
                    <ImportFlowModal bots={bots} />
                    <NewFlowModal bots={bots} />
                </div>
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

            {/* Fluxos Grouped by Bot */}
            <div className="space-y-12">
                {bots.map((bot: any) => {
                    const botFlows = flows.filter((f: any) => f.botId === bot.id);
                    if (botFlows.length === 0) return null;

                    return (
                        <div key={bot.id} className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-1 h-6 bg-[#ff5100] rounded-full" />
                                <h2 className="text-xl font-bold text-[#2d3339]">{bot.name}</h2>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                                    {botFlows.length} {botFlows.length === 1 ? 'Fluxo' : 'Fluxos'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {botFlows.map((fluxo: any) => (
                                    <div key={fluxo.id} className="glass-card bg-white p-6 rounded-2xl group hover:border-[#ff5100]/30 transition-all duration-300 flex flex-col h-full border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FlowMenu flowId={fluxo.id} flowName={fluxo.name} />
                                        </div>

                                        <div className="flex flex-col gap-5 h-full">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff5100] group-hover:bg-[#ff5100] group-hover:text-white transition-all duration-300 shadow-sm">
                                                <MessageSquare size={24} />
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-[#2d3339] truncate max-w-[180px]">{fluxo.name}</h3>
                                                    <span className={fluxo.status === "PUBLISHED"
                                                        ? "w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                                        : "w-2 h-2 rounded-full bg-slate-300"
                                                    } />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {fluxo.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                                                    </p>
                                                    <span className="text-slate-200 text-[10px]">•</span>
                                                    <span className="text-[10px] text-slate-400 font-bold opacity-60">
                                                        {formatDistanceToNow(new Date(fluxo.updatedAt), { addSuffix: true, locale: ptBR })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[11px] font-bold text-[#2d3339]">{fluxo.steps} Blocos</span>
                                                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">Gatilho: {fluxo.triggers}</span>
                                                </div>
                                                <Link
                                                    href={`/fluxos/${fluxo.id}`}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl group-hover:bg-[#ff5100] group-hover:text-white transition-all duration-300 shadow-sm"
                                                >
                                                    <ArrowRight size={18} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {flows.length === 0 && (
                    <div className="py-20 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                            <MessageSquare size={32} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Nenhum fluxo criado ainda.</p>
                        <p className="text-slate-300 text-xs mt-1 font-medium">Clique no botão acima para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
