"use client";

import React from "react";
import { Clock, MessageSquareText } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function DelayNode({ data, selected }: any) {
    return (
        <BaseNode
            title="Atraso Inteligente"
            icon={<Clock size={18} strokeWidth={3} />}
            selected={selected}
            colorClass="bg-black"
        >
            <div className="space-y-6">
                <div className="flex items-center justify-center p-8 bg-black/5 rounded-[2rem] border-2 border-black/5">
                    <p className="text-5xl font-black text-black tracking-tighter">{data.delay || 3}<span className="text-sm uppercase tracking-widest ml-2">s</span></p>
                </div>

                {data.showTyping && (
                    <div className="flex items-center gap-3 bg-black text-white p-4 rounded-2xl shadow-xl shadow-black/10">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exibindo Digitante...</span>
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
