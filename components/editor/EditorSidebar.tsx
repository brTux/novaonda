"use client";

import React from "react";
import {
    MessageSquare,
    Play,
    Zap,
    Image as ImageIcon,
    Database,
    Clock,
    Settings2,
    X
} from "lucide-react";

export function EditorSidebar({ onAddNode }: { onAddNode: (type: string, data?: any) => void }) {
    const groups = [
        {
            title: "Mensagens",
            items: [
                { type: "MESSAGE", label: "Texto", icon: MessageSquare, color: "bg-blue-500" },
                { type: "MESSAGE", label: "Texto com Botões", icon: Zap, color: "bg-indigo-500", data: { hasButtons: true, buttons: [] } },
                { type: "IMAGE", label: "Imagem", icon: ImageIcon, color: "bg-emerald-500" },
                { type: "VIDEO", label: "Vídeo", icon: Play, color: "bg-rose-500" },
                { type: "AUDIO", label: "Áudio", icon: Clock, color: "bg-amber-500" },
            ]
        },
        {
            title: "Vendas & Pagamentos",
            items: [
                { type: "ACTION", label: "Gerar Pix", icon: Zap, color: "bg-[#ff5100]", data: { subType: "PIX" } },
                { type: "ACTION", label: "Pix Personalizado", icon: Settings2, color: "bg-[#ff5100]", data: { subType: "PIX_CUSTOM" } },
                { type: "ACTION", label: "Link de Checkout", icon: Database, color: "bg-[#ff5100]", data: { subType: "CHECKOUT" } },
            ]
        },
        {
            title: "Automação & Lógica",
            items: [
                { type: "DELAY", label: "Espera Fixa", icon: Clock, color: "bg-orange-400" },
                { type: "DELAY", label: "Atraso Inteligente", icon: Clock, color: "bg-purple-400", data: { isSmart: true } },
                { type: "INPUT", label: "Coleta de Dados", icon: Database, color: "bg-cyan-500" },
                { type: "ACTION", label: "Executar Ação/API", icon: Zap, color: "bg-slate-400" },
                { type: "ACTION", label: "Fim do Fluxo", icon: X, color: "bg-red-500", data: { subType: "END" } },
            ]
        }
    ];

    return (
        <aside className="w-72 border-r border-slate-100 bg-white flex flex-col pt-8">
            <div className="px-8 mb-6">
                <h3 className="text-[10px] uppercase font-bold text-[#555d66] tracking-widest mb-1">Biblioteca</h3>
                <p className="text-[9px] text-slate-400 font-medium">Clique para adicionar elementos</p>
            </div>

            <div className="flex-1 px-4 space-y-8 overflow-y-auto pb-8">
                {groups.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <h4 className="px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{group.title}</h4>
                        <div className="space-y-1.5">
                            {group.items.map((el) => (
                                <button
                                    key={`${el.type}-${el.label}`}
                                    onClick={() => onAddNode(el.type, el.data)}
                                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-50 hover:border-[#ff5100]/30 hover:bg-orange-50/20 transition-all group text-left"
                                >
                                    <div className={`w-8 h-8 rounded-lg ${el.color} flex items-center justify-center text-white shadow-sm group-active:scale-95 transition-transform`}>
                                        <el.icon size={16} />
                                    </div>
                                    <span className="text-[11px] font-bold text-[#2d3339] tracking-tight">{el.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
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
