"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    selected?: boolean;
    colorClass?: string;
}

export function BaseNode({ title, icon, children, selected, colorClass = "bg-[#ff5100]" }: BaseNodeProps) {
    return (
        <div className={cn(
            "bg-white border-2 rounded-xl min-w-[260px] overflow-hidden transition-all duration-200 shadow-sm",
            selected ? "border-[#ff5100] shadow-lg scale-[1.02]" : "border-slate-100"
        )}>
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-white border-2 border-[#ff5100] !-top-1.5"
            />

            <div className="p-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0", colorClass)}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16 }) : icon}
                </div>
                <span className="font-bold text-[#2d3339] text-xs uppercase tracking-wider truncate">{title}</span>
            </div>

            <div className="p-5">
                {children}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-[#ff5100] border-2 border-white !-bottom-1.5 shadow-sm"
            />
        </div>
    );
}
