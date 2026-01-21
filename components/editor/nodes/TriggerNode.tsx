"use client";

import React from "react";
import { Play, Tag, Terminal, UserPlus, Type } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function TriggerNode({ data, selected }: any) {
    const getTriggerIcon = () => {
        switch (data.triggerType) {
            case 'TAG': return <Tag size={18} />;
            case 'COMMAND': return <Terminal size={18} />;
            case 'NEW_LEAD': return <UserPlus size={18} />;
            default: return <Type size={18} />;
        }
    };

    const getTriggerLabel = () => {
        switch (data.triggerType) {
            case 'TAG': return "Tag Recebida";
            case 'COMMAND': return "Comando (/)";
            case 'NEW_LEAD': return "Novo Lead";
            default: return "Palavra-chave";
        }
    };

    return (
        <BaseNode
            title="Gatilho de Entrada"
            icon={getTriggerIcon()}
            selected={selected}
            colorClass="bg-[#ff5100]"
        >
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getTriggerLabel()}</p>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                            {data.triggerType === 'NEW_LEAD' ? "Qualquer Novo Contato" : (data.trigger || "Não configurado")}
                        </p>
                    </div>
                </div>
            </div>
        </BaseNode>
    );
}
