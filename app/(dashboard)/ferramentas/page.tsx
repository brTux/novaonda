"use client";

import React from "react";
import Link from "next/link";
import { Wrench, Layout, CheckCircle, CreditCard, ArrowRight, Sparkles, Wand2, Facebook } from "lucide-react";

const tools = [
    {
        id: "pressel",
        name: "Criador de Pressel",
        description: "Gere páginas de pré-venda de alta conversão para seus anúncios.",
        icon: Layout,
        color: "text-[#586ee0] bg-[#eef0ff]",
        href: "/ferramentas/pressel"
    },
    {
        id: "obrigado",
        name: "Páginas de Obrigado",
        description: "Personalize a experiência pós-venda para converter mais o LTV.",
        icon: CheckCircle,
        color: "text-emerald-500 bg-emerald-50",
        href: "/ferramentas/obrigado"
    },
    {
        id: "checkout",
        name: "Páginas de Checkout/Pix",
        description: "Crie checkouts que geram cobranças Pix automáticas via API.",
        icon: CreditCard,
        color: "text-[#ff5100] bg-[#fff5f0]",
        href: "/ferramentas/checkout"
    },
    {
        id: "tracking",
        name: "Meta Pixel & CAPI",
        description: "Configure o rastreamento profissional e API de conversões para vender mais.",
        icon: Facebook,
        color: "text-blue-500 bg-blue-50",
        href: "/ferramentas/tracking"
    }
];

export default function FerramentasPage() {
    return (
        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 flex items-center justify-center text-[#ff5100]">
                        <Wrench size={18} />
                    </div>
                    <span className="text-[#ff5100] font-bold text-[10px] uppercase tracking-wider">Suite de Ferramentas</span>
                </div>
                <h1 className="text-2xl font-bold text-[#2d3339]">Potencialize suas Vendas</h1>
                <p className="text-sm text-[#555d66] font-medium max-w-xl">Ferramentas avançadas integradas ao ecossistema Nova Onda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={tool.href}
                        className="group flex flex-col bg-white p-8 rounded-xl border border-slate-100 hover:border-[#ff5100]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                    >
                        <div className={tool.color + " w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"}>
                            <tool.icon size={24} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-[#2d3339] mb-2">{tool.name}</h3>
                            <p className="text-[#555d66] text-xs leading-relaxed mb-6 font-medium">{tool.description}</p>

                            <div className="flex items-center gap-2 text-[#ff5100] font-bold text-xs">
                                Configurar Ferramenta
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* AI Banner - Hotmart Aesthetic */}
            <div className="bg-[#2d3339] p-8 md:p-12 rounded-3xl text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles size={180} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <span className="bg-[#ff5100] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">Novidade Em Breve</span>
                    <h2 className="text-2xl font-bold mb-3">Copywriter com Inteligência Artificial</h2>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Crie textos persuasivos para suas pressels e automações usando IA treinada para conversão.</p>
                    <button className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#ff5100]/10 hover:bg-[#e64a00] transition-all">
                        <Wand2 size={18} />
                        Entrar na Lista Vip
                    </button>
                </div>
            </div>
        </div>
    );
}
