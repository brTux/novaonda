"use client";

import React from "react";
import { Clock, Zap } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function DelayNode({ data, selected }: any) {
    return (
        <BaseNode
            title={data.isSmart ? "Atraso Inteligente" : "Espera Fixa"}
            icon={data.isSmart ? <Zap size={18} /> : <Clock size={18} />}
            selected={selected}
            colorClass={data.isSmart ? "bg-purple-500" : "bg-orange-400"}
        >
            <div className="space-y-4">
                <div className={`flex items-center justify-center p-6 rounded-2xl border-2 transition-all ${selected ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent'}`}>
                    <p className="text-4xl font-black text-slate-700 tracking-tighter">
                        {data.delay || 3}
                        <span className="text-xs uppercase tracking-widest ml-1 font-bold text-slate-400">seg</span>
                    </p>
                </div>

                {data.showTyping && (
                    <div className="flex items-center gap-3 bg-slate-800 text-white p-3 rounded-xl shadow-lg">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider">Digitando...</span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
