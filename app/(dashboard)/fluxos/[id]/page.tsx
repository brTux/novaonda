import React from "react";
import { getFlowById } from "@/app/actions/flows";
import { FlowEditor } from "@/components/editor/FlowEditor";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Play, Settings } from "lucide-react";

interface FlowPageProps {
    params: Promise<{ id: string }>;
}

export default async function FlowPage({ params }: FlowPageProps) {
    const { id } = await params;
    const flow = await getFlowById(id);

    if (!flow) {
        notFound();
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <header className="h-14 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20">
                <div className="flex items-center gap-4">
                    <Link
                        href="/fluxos"
                        className="p-1.5 text-slate-400 hover:text-[#2d3339] hover:bg-slate-50 rounded-lg transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h2 className="font-bold text-[#2d3339] text-sm flex items-center gap-2">
                            {flow.name}
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">Rascunho</span>
                        </h2>
                        <p className="text-[10px] text-slate-400 font-medium">Editando agora</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-[#555d66] rounded-lg font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200">
                        <Settings size={14} />
                        Configurar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-1.5 bg-[#ff5100] text-white rounded-lg font-bold text-xs hover:bg-[#e64a00] transition-all shadow-md shadow-[#ff5100]/10">
                        <Play size={14} />
                        Testar Fluxo
                    </button>
                </div>
            </header>

            <FlowEditor initialData={flow} />
        </div>
    );
}
