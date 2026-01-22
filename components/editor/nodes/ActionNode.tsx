"use client";

import React from "react";
import { Zap, CreditCard, XCircle, Settings } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ActionNode({ data, selected }: any) {
    const getActionInfo = () => {
        switch (data.subType) {
            case 'PIX':
            case 'PIX_CUSTOM':
                return {
                    title: "Gerar Pix",
                    icon: <Zap size={18} strokeWidth={3} />,
                    color: "bg-[#ff5100]",
                    label: "PIX API",
                    value: data.amount ? `R$ ${data.amount} (Auto)` : "Configurar Valor"
                };
            case 'CHECKOUT':
                return {
                    title: "Link de Checkout",
                    icon: <CreditCard size={18} />,
                    color: "bg-emerald-600",
                    label: "CHECKOUT",
                    value: data.url ? "Link Configurado" : "Definir Link"
                };
            case 'END':
                return {
                    title: "Encerrar Fluxo",
                    icon: <XCircle size={18} />,
                    color: "bg-red-500",
                    label: "FIM",
                    value: "Parar Automação"
                };
            default:
                return {
                    title: "Ação Personalizada",
                    icon: <Settings size={18} />,
                    color: "bg-slate-500",
                    label: "AÇÃO",
                    value: data.webhook || "Configurar URL"
                };
        }
    };

    const info = getActionInfo();

    return (
        <BaseNode
            title={info.title}
            icon={info.icon}
            selected={selected}
            colorClass={info.color}
        >
            <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent'}`}>
                <div className={`w-10 h-10 ${info.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                    {React.cloneElement(info.icon as any, { size: 20 })}
                </div>
                <div>
                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">{info.label}</p>
                    <p className="text-xs font-bold text-slate-700 leading-tight truncate max-w-[140px] uppercase tracking-tight">{info.value}</p>
                </div>
            </div>
        </BaseNode>
    );
}
