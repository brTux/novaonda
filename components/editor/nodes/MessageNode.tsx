"use client";

import React from "react";
import { MessageSquare, Layout } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function MessageNode({ data, selected }: any) {
    return (
        <BaseNode
            title={data.hasButtons ? "Mensagem com Botões" : "Enviar Mensagem"}
            icon={data.hasButtons ? <Layout size={18} /> : <MessageSquare size={18} />}
            selected={selected}
            colorClass={data.hasButtons ? "bg-indigo-600" : "bg-blue-500"}
        >
            <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[11px] text-slate-600 font-medium line-clamp-3 leading-relaxed">
                        {data.text || "Digite sua mensagem..."}
                    </p>
                </div>

                {data.hasButtons && data.buttons?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {data.buttons.map((btn: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-bold border border-indigo-100">
                                {btn.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </BaseNode>
    );
}
