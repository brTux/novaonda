"use client";

import React from "react";
import { Database, Hash, Mail, Phone, Type } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function InputNode({ data, selected }: any) {
    const getInputIcon = () => {
        switch (data.inputType) {
            case 'number': return <Hash size={14} />;
            case 'email': return <Mail size={14} />;
            case 'phone': return <Phone size={14} />;
            default: return <Type size={14} />;
        }
    };

    return (
        <BaseNode
            title="Coleta de Dados"
            icon={<Database size={18} />}
            selected={selected}
            colorClass="bg-cyan-500"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Salvar na Variável</p>
                    <div className="bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-[11px] tracking-wide shadow-md flex items-center gap-2">
                        {getInputIcon()}
                        <span className="truncate">{data.variable ? `{{${data.variable}}}` : "Nome da Variável..."}</span>
                    </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Aguardar Resposta</span>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>
        </BaseNode>
    );
}
