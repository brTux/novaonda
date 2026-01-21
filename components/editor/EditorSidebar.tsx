"use client";

import React from "react";
import {
    MessageSquare,
    Play,
    Zap,
    Image as ImageIcon,
    Database,
    Clock
} from "lucide-react";

export function EditorSidebar({ onAddNode }: { onAddNode: (type: string) => void }) {
    const elements = [
        { type: "trigger", label: "Gatilho de Entrada", icon: Play, color: "bg-[#ff5100]" },
        { type: "message", label: "Enviar Mensagem", icon: MessageSquare, color: "bg-blue-500" },
        { type: "media", label: "Enviar Mídia", icon: ImageIcon, color: "bg-emerald-500" },
        { type: "collection", label: "Coleta de Dados", icon: Database, color: "bg-indigo-500" },
        { type: "delay", label: "Atraso / Digitando", icon: Clock, color: "bg-orange-400" },
        { type: "action", label: "Gerar Pix / Ação", icon: Zap, color: "bg-[#ffb800]" },
    ];

    return (
        <aside className="w-72 border-r border-slate-100 bg-white flex flex-col pt-8">
            <div className="px-8 mb-8">
                <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest mb-1">Biblioteca</h3>
                <p className="text-[9px] text-slate-400 font-medium">Arraste ou clique para adicionar</p>
            </div>

            <div className="flex-1 px-4 space-y-2 overflow-y-auto">
                {elements.map((el) => (
                    <button
                        key={el.type}
                        onClick={() => onAddNode(el.type)}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100 hover:border-[#ff5100]/30 hover:bg-orange-50/30 transition-all group text-left"
                    >
                        <div className={`w-9 h-9 rounded-lg ${el.color} flex items-center justify-center text-white shadow-sm group-active:scale-95 transition-transform`}>
                            <el.icon size={18} />
                        </div>
                        <span className="text-xs font-bold text-[#2d3339] tracking-tight">{el.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <div className="bg-[#2d3339] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-wider mb-2 text-[#ff5100]">Atalhos Úteis</p>
                    <p className="text-[10px] leading-relaxed font-medium opacity-80">
                        Segure <span className="font-bold text-[#ff5100]">Ctrl</span> e selecione para mover em massa.
                    </p>
                </div>
            </div>
        </aside>
    );
}
