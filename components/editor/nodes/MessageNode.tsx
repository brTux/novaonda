"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import { BaseNode } from "./BaseNode";

export function MessageNode({ data, selected }: any) {
    return (
        <BaseNode
            title="Enviar Texto"
            icon={<MessageSquare size={18} strokeWidth={3} />}
            selected={selected}
            colorClass="bg-black"
        >
            <div className="bg-black/5 p-5 rounded-[1.5rem] border-2 border-black/10">
                <p className="text-sm font-bold text-black leading-relaxed italic">
                    "{data.text || "Digite sua mensagem..."}"
                </p>
            </div>
        </BaseNode>
    );
}
