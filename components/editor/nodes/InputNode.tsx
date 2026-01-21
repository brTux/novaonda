"use client";

import React from "react";
import { Database, Hash, Mail, Phone, Type, Clock, CheckCircle2 } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

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
        <div className={cn(
            "bg-white border-2 rounded-xl min-w-[260px] overflow-hidden transition-all duration-200 shadow-sm",
            selected ? "border-cyan-500 shadow-lg scale-[1.02]" : "border-slate-100"
        )}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-white border-2 border-cyan-500 !-top-1.5"
            />

            <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Database size={16} />
                </div>
                <span className="font-bold text-[#2d3339] text-xs uppercase tracking-wider truncate">Coleta de Dados</span>
            </div>

            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Salvar na Variável</p>
                    <div className="bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-[11px] tracking-wide shadow-md flex items-center gap-2">
                        {getInputIcon()}
                        <span className="truncate">{data.variable ? `{{${data.variable}}}` : "Nome da Variável..."}</span>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Caminhos de Saída</p>

                    {/* Success Handle */}
                    <div className="relative flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl group">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">Se Responder</span>
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="success"
                            className="w-3 h-3 bg-emerald-500 border-2 border-white !-right-1.5"
                        />
                    </div>

                    {/* Timeout Handle */}
                    <div className="relative flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl group">
                        <div className="flex items-center gap-2">
                            <Clock size={12} className="text-orange-500" />
                            <span className="text-[10px] font-bold text-orange-700 uppercase">Se Não Responder</span>
                        </div>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="timeout"
                            className="w-3 h-3 bg-orange-500 border-2 border-white !-right-1.5"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
