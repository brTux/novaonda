"use client";

import React from "react";
import { CreditCard, ArrowLeft, Save, ShieldCheck, Zap, Globe } from "lucide-react";
import Link from "next/link";

export default function CheckoutCreator() {
    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/ferramentas" className="text-[#555d66] hover:text-[#ff5100] transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-2xl font-bold text-[#2d3339]">Configurar Checkout/Pix</h1>
                        <p className="text-sm text-[#555d66] font-medium">Configure seus gatilhos de pagamento automático.</p>
                    </div>
                </div>

                <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/10 hover:bg-[#e64a00]">
                    <Save size={18} />
                    Salvar Configuração
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Configuration form */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#2d3339] uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#ff5100]" />
                            Credenciais de Integração
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Gateway de Pagamento</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold text-[#2d3339] outline-none focus:border-[#ff5100] transition-all">
                                    <option>Mercado Pago (Oficial)</option>
                                    <option>Stripe</option>
                                    <option>OpenPix</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">API Key / Token</label>
                                <input
                                    type="password"
                                    placeholder="APP_USR-73829-..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium outline-none focus:border-[#ff5100] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#2d3339] uppercase tracking-wider flex items-center gap-2">
                            <Zap size={16} className="text-[#ff5100]" />
                            Regras do Pix Dinâmico
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Valor Padrão</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">R$</span>
                                    <input
                                        type="number"
                                        placeholder="97,00"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-9 text-sm font-bold outline-none focus:border-[#ff5100] transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Tempo de Expiração</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="30"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pr-10 text-sm font-bold outline-none focus:border-[#ff5100] transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-[10px] uppercase">Min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview / Instructions */}
                <div className="p-10 rounded-2xl bg-[#2d3339] text-white flex flex-col justify-center gap-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Globe size={200} />
                    </div>

                    <div className="text-center space-y-4 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#ff5100] mx-auto border border-white/10">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Sincronização via Webhook</h3>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">Use esta URL no seu gateway para confirmar pagamentos instantaneamente.</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 relative z-10 group">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Endpoint de Notificação</label>
                        <div className="bg-black/20 p-4 rounded-lg text-xs font-mono text-[#ff5100] truncate border border-white/5 group-hover:border-[#ff5100]/30 transition-all">
                            https://api.novaonda.com/hook/pix/u_7382
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
