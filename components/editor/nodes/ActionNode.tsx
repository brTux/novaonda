"use client";

import React from "react";
import { Zap } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function ActionNode({ data, selected }: any) {
    return (
        <BaseNode
            title="Ação / Pix"
            icon={<Zap size={18} strokeWidth={3} />}
            selected={selected}
            colorClass="bg-black"
        >
            <div className="flex items-center gap-4 bg-black/5 p-5 rounded-[1.5rem] border-2 border-black/5 group hover:border-black transition-all">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Zap size={22} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black text-black/40 tracking-widest leading-none mb-1">PIX GERADO</p>
                    <p className="text-sm font-black text-black leading-tight uppercase tracking-tight">{data.action || "Configurar Valor..."}</p>
                </div>
            </div>
        </BaseNode>
    );
}
