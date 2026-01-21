"use client";

import React from "react";
import { Image as ImageIcon, Video, Music } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function MediaNode({ data, selected }: any) {
    const Icon = data.mediaType === "video" ? Video : data.mediaType === "audio" ? Music : ImageIcon;

    return (
        <BaseNode
            title={`Enviar ${data.mediaType || "Mídia"}`}
            icon={<Icon size={18} strokeWidth={3} />}
            selected={selected}
            colorClass="bg-black"
        >
            <div className="space-y-4">
                <div className="aspect-video bg-black/5 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-black/10 transition-all hover:bg-black group">
                    <Icon size={32} strokeWidth={2.5} className="text-black/20 group-hover:text-white" />
                    <p className="text-[9px] font-black text-black/30 mt-3 uppercase tracking-widest group-hover:text-white">Visualização Indisponível</p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-black opacity-40 uppercase tracking-widest">URL do Arquivo</p>
                    <p className="text-[11px] font-bold text-black truncate italic">{data.url || "Nenhuma URL configurada"}</p>
                </div>
            </div>
        </BaseNode>
    );
}
