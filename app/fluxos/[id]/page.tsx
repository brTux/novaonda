"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { FlowEditor } from "@/components/editor/FlowEditor";
import { useParams } from "next/navigation";

export default function EditorPage() {
    const params = useParams();
    const id = params.id;

    return (
        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
            {/* Editor Header - High Contrast */}
            <div className="h-20 border-b-2 border-black/5 bg-white flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-8">
                    <Link
                        href="/fluxos"
                        className="flex items-center gap-2 text-black/40 hover:text-black transition-all font-black text-[11px] uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} strokeWidth={3} />
                        Sair do Editor
                    </Link>
                    <div className="h-8 w-1 bg-black/5 rounded-full" />
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black tracking-tighter text-black uppercase">Editor Visual</h1>
                        <span className="px-3 py-1 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">#{id}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-black/5 text-black px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Simular Fluxo
                    </button>
                    <button className="flex items-center gap-2 bg-black text-white px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-105 active:scale-95">
                        <Save size={18} strokeWidth={3} />
                        Publicar Agora
                    </button>
                </div>
            </div>

            {/* Editor Main Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[#ffffff] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                <FlowEditor />
            </div>
        </div>
    );
}
