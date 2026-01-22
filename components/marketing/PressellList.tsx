"use client";

import React, { useState } from "react";
import { Plus, Globe, ExternalLink, Trash2, Copy, CheckCircle2, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import NewPressellModal from "./NewPressellModal";
import { deletePressell } from "@/app/actions/marketing";

interface PressellListProps {
    initialPressells: any[];
    bots: any[];
}

export default function PressellList({ initialPressells, bots }: PressellListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pressells, setPressells] = useState(initialPressells);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta Pressell?")) return;
        try {
            await deletePressell(id);
            setPressells(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Erro ao excluir: " + err);
        }
    }

    function copyLink(slug: string, id: string) {
        const url = `${window.location.origin}/p/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#2d3339]">Suas Pressells</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#ff5100] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]"
                >
                    <Plus size={16} />
                    Criar Pressell
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pressells.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Globe size={40} strokeWidth={1.5} />
                        <p className="text-sm font-medium">Nenhuma Pressell criada ainda.</p>
                    </div>
                ) : (
                    pressells.map((p) => (
                        <div key={p.id} className="glass-card bg-white border border-slate-100 flex flex-col overflow-hidden group hover:shadow-lg transition-all">
                            <div className="p-5 border-b border-slate-50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-[#ff5100] uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">Vturb / Youtube</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => copyLink(p.slug, p.id)}
                                            className="p-1.5 text-slate-400 hover:text-[#ff5100] rounded-lg hover:bg-slate-50 transition-all"
                                            title="Copiar Link"
                                        >
                                            {copiedId === p.id ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#2d3339] truncate">{p.title}</h3>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">/p/{p.slug}</p>
                            </div>

                            <div className="p-5 flex flex-col gap-3 bg-slate-50/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Bot de Destino</span>
                                        <span className="text-xs font-bold text-[#2d3339]">{p.bot?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/ferramentas/pressel/${p.id}/builder`}
                                            className="flex items-center gap-1.5 bg-slate-100 text-[#2d3339] px-3 py-1.5 rounded-lg font-bold text-[10px] hover:bg-slate-200 transition-all border border-slate-200"
                                            title="Editar Layout"
                                        >
                                            <LayoutTemplate size={14} />
                                            Editar Layout
                                        </Link>
                                        <a
                                            href={`/p/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-[#ff5100] hover:border-[#ff5100] shadow-sm transition-all"
                                            title="Ver Página"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <NewPressellModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                bots={bots}
                onCreated={(newP) => setPressells([newP, ...pressells])}
            />
        </div>
    );
}
