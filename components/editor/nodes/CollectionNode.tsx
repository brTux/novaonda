"use client";

import React from "react";
import { Database, Clock, ChevronRight } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

export function CollectionNode({ data, selected }: any) {
    return (
        <div className={cn(
            "glass-card rounded-[2.5rem] min-w-[320px] overflow-hidden transition-all duration-300 bg-white border-2",
            selected ? "ring-4 ring-black shadow-2xl scale-[1.05]" : "border-black/5"
        )}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-4 h-4 bg-white border-4 border-black !-top-2"
            />

            <div className="p-6 border-b-2 border-black/5 flex items-center gap-4 bg-white">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow-xl">
                    <Database size={24} strokeWidth={2.5} />
                </div>
                <span className="font-black text-black text-sm uppercase tracking-[0.2em]">Coleta de Dados</span>
            </div>

            <div className="p-8 space-y-6 bg-white">
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest mb-1">VARIÁVEL</p>
                    <div className="bg-black text-white px-5 py-3 rounded-xl font-black text-[12px] tracking-widest shadow-lg">
                        {data.variable ? `{${data.variable}}` : "Nome da Variável..."}
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-black/5 p-3 rounded-xl">
                    <Clock size={14} strokeWidth={3} className="text-black" />
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">Timeout: {data.timeout || 60}s</span>
                </div>

                <div className="space-y-3 pt-4">
                    <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">CAMINHOS</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-black/5 rounded-xl border-2 border-transparent hover:border-black transition-all group relative">
                            <div className="flex items-center gap-3">
                                <ChevronRight size={16} strokeWidth={3} className="text-black" />
                                <span className="text-[11px] font-black text-black uppercase tracking-widest">Resposta</span>
                            </div>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id="success"
                                className="w-4 h-4 bg-black border-4 border-white !-right-2"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border-2 border-transparent hover:border-red-500 transition-all group relative">
                            <div className="flex items-center gap-3">
                                <Clock size={16} strokeWidth={3} className="text-red-600" />
                                <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">Timeout</span>
                            </div>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id="timeout"
                                className="w-4 h-4 bg-red-600 border-4 border-white !-right-2"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
