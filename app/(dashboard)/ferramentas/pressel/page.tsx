"use client";

import React from "react";
import { Layout, ArrowLeft, Plus, Globe, Smartphone, MousePointer2, Save } from "lucide-react";
import Link from "next/link";

export default function PresselCreator() {
    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-white">
            {/* Toolbar - Hotmart Aesthetic */}
            <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/ferramentas" className="text-[#555d66] hover:text-[#ff5100] transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-slate-100 hidden sm:block" />
                    <h1 className="text-lg font-bold text-[#2d3339] truncate">Criador de Pressel</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button className="p-2 bg-white text-[#ff5100] rounded shadow-sm"><Globe size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-[#2d3339] transition-all"><Smartphone size={16} /></button>
                    </div>
                    <button className="flex items-center gap-2 bg-[#ff5100] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]">
                        <Save size={16} />
                        Salvar Projeto
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor Sidebar */}
                <aside className="hidden md:flex w-80 border-r border-slate-100 bg-slate-50/30 overflow-y-auto p-6 flex-col gap-8">
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest">Modelos de Layout</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button className="flex items-center gap-3 p-4 rounded-xl bg-white border-2 border-[#ff5100] text-[#ff5100] font-bold text-xs shadow-sm">
                                <Layout size={18} /> Quiz Interativo
                            </button>
                            <button className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 text-[#2d3339] font-bold text-xs hover:border-[#ff5100]/30 transition-all">
                                <MousePointer2 size={18} /> Botão com Oferta
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest">Componentes</h3>
                        <button className="w-full flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#ff5100] hover:text-[#ff5100] transition-all font-bold text-xs">
                            <Plus size={18} /> Adicionar Bloco
                        </button>
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="flex-1 bg-slate-100 p-6 md:p-12 overflow-y-auto flex justify-center items-start">
                    {/* Device Mockup */}
                    <div className="w-full max-w-[380px] min-h-[700px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-[#2d3339] relative animate-in zoom-in duration-500">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2d3339] rounded-b-2xl z-20" />

                        <div className="h-full overflow-y-auto pt-12 pb-8 px-8">
                            <div className="space-y-8 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#ff5100] mx-auto shadow-lg flex items-center justify-center text-white font-bold text-xl">N</div>
                                <h2 className="text-2xl font-bold text-[#2d3339] leading-tight tracking-tight">Pronto para dominar o Telegram?</h2>
                                <p className="text-sm text-[#555d66] font-medium leading-relaxed">Responda 3 perguntas rápidas para liberar sua licença gratuita hoje.</p>

                                <div className="space-y-3">
                                    {["Sim, já vendo muito", "Estou começando agora", "Apenas curioso"].map((opt, i) => (
                                        <button key={i} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-[#2d3339] font-bold text-xs text-center hover:border-[#ff5100] transition-all">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
