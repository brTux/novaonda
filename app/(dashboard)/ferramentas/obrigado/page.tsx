"use client";

import React from "react";
import { CheckCircle, ArrowLeft, Save, Sparkles, Send, Share2 } from "lucide-react";
import Link from "next/link";

export default function ObrigadoCreator() {
    return (
        <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 bg-white">
            {/* Toolbar - Hotmart Aesthetic */}
            <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/ferramentas" className="text-[#555d66] hover:text-[#ff5100] transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <h1 className="text-lg font-bold text-[#2d3339]">Página de Obrigado</h1>
                </div>

                <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]">
                    <Save size={16} />
                    Salvar Template
                </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Editor Sidebar */}
                <aside className="hidden md:flex w-80 border-r border-slate-100 bg-slate-50/30 overflow-y-auto p-8 flex-col gap-10">
                    <div className="space-y-6">
                        <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest">Configuração</h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Título Principal</label>
                                <input
                                    type="text"
                                    defaultValue="Pagamento confirmado!"
                                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-bold text-[#2d3339] outline-none focus:border-[#ff5100]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Mensagem Lateral</label>
                                <textarea
                                    defaultValue="Verifique seu e-mail agora mesmo para começar."
                                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-medium text-[#2d3339] outline-none h-24 focus:border-[#ff5100]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest">Ações Rápidas</h3>
                        <div className="flex flex-col gap-2">
                            <button className="w-full p-3 rounded-lg bg-slate-100 text-[#2d3339] font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                <Send size={14} /> Suporte Telegram
                            </button>
                            <button className="w-full p-3 rounded-lg bg-slate-100 text-[#2d3339] font-bold text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                <Share2 size={14} /> Compartilhar
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Preview Area */}
                <main className="flex-1 bg-slate-100 p-8 md:p-20 overflow-y-auto flex items-center justify-center">
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-10 md:p-16 text-center space-y-10 animate-in zoom-in duration-500 border border-slate-100">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
                            <CheckCircle size={40} />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-[#2d3339] leading-tight">Sua compra foi concluída!</h2>
                            <p className="text-sm text-[#555d66] font-medium leading-relaxed max-w-sm mx-auto">Em instantes você receberá os dados de acesso no e-mail cadastrado.</p>
                        </div>

                        <div className="h-px w-16 bg-slate-100 mx-auto" />

                        <div className="space-y-4">
                            <button className="w-full py-4 bg-[#ff5100] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/10 flex items-center justify-center gap-3 hover:bg-[#e64a00] transition-all">
                                <Sparkles size={18} />
                                ACESSAR CONTEÚDO AGORA
                            </button>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dúvidas? Entre em contato</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
