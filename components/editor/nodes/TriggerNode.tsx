"use client";

import React from "react";
import { Play } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function TriggerNode({ data, selected }: any) {
    return (
        <BaseNode
            title="Início / Gatilho"
            icon={<Play size={18} strokeWidth={3} />}
            selected={selected}
            colorClass="bg-black"
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">Gatilho</label>
                    <div className="bg-black/5 p-4 rounded-xl border-2 border-black/5">
                        <p className="text-sm font-black text-black uppercase tracking-tight">{data.trigger || "Nova Conversa"}</p>
                    </div>
                </div>
                <p className="text-[10px] text-black font-bold opacity-30 leading-relaxed italic">
                    Este nó inicia o fluxo quando um novo usuário envia uma mensagem.
                </p>
            </div>
        </BaseNode>
    );
}
