"use client";

import React from "react";
import { Image as ImageIcon, Video, Music, FileText } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function MediaNode({ data, selected }: any) {
    const Icon = data.mediaType === "video" ? Video : data.mediaType === "audio" ? Music : data.mediaType === "file" ? FileText : ImageIcon;

    return (
        <BaseNode
            title={`Mídia: ${data.mediaType || "Arquivo"}`}
            icon={<Icon size={18} />}
            selected={selected}
            colorClass="bg-emerald-500"
        >
            <div className="space-y-4">
                <div className={`aspect-video rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${selected ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                    <Icon size={32} className={selected ? "text-emerald-400" : "text-slate-300"} />
                    <p className={`text-[9px] font-bold mt-2 uppercase tracking-widest ${selected ? "text-emerald-500" : "text-slate-400"}`}>
                        {data.url ? "Mídia Carregada" : "Sem Arquivo"}
                    </p>
                </div>
                {data.caption && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-500 italic line-clamp-2">"{data.caption}"</p>
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
