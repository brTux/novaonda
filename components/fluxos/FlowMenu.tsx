"use client";

import React, { useState } from "react";
import { MoreHorizontal, Download, Share2, Loader2, Link as LinkIcon, Check, Copy } from "lucide-react";
import { generateShareCode, getFullFlowForExport } from "@/app/actions/flows";
import { toast } from "sonner";

interface FlowMenuProps {
    flowId: string;
    flowName: string;
}

export function FlowMenu({ flowId, flowName }: FlowMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [shareCode, setShareCode] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const fullFlow = await getFullFlowForExport(flowId);
            if (!fullFlow) {
                toast.error("Erro ao buscar dados do fluxo");
                return;
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullFlow, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${flowName.replace(/\s+/g, '_')}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            setIsOpen(false);
            toast.success("Fluxo exportado com sucesso!");
        } catch (err) {
            toast.error("Erro ao exportar");
        } finally {
            setIsExporting(false);
        }
    };

    const handleShare = async () => {
        setIsGenerating(true);
        try {
            const result = await generateShareCode(flowId);
            if (result.success) {
                setShareCode(result.shareCode!);
            } else {
                toast.error(result.error || "Erro ao gerar código");
            }
        } catch (err) {
            toast.error("Erro fatal ao compartilhar");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success("Copiado!");
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
                title="Mais opções"
            >
                <MoreHorizontal size={18} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                            setIsOpen(false);
                            setShareCode(null);
                        }}
                    />
                    <div className="absolute right-0 top-10 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                        {!shareCode ? (
                            <>
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                                >
                                    {isExporting ? (
                                        <Loader2 size={16} className="animate-spin text-[#ff5100]" />
                                    ) : (
                                        <Download size={16} className="text-[#ff5100]" />
                                    )}
                                    Exportar JSON
                                </button>
                                <button
                                    onClick={handleShare}
                                    disabled={isGenerating}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <Loader2 size={16} className="animate-spin text-[#ff5100]" />
                                    ) : (
                                        <Share2 size={16} className="text-[#ff5100]" />
                                    )}
                                    Compartilhar por Código
                                </button>
                            </>
                        ) : (
                            <div className="px-4 py-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</span>
                                    <button
                                        onClick={() => setShareCode(null)}
                                        className="text-slate-400 hover:text-slate-600"
                                        aria-label="Fechar"
                                        title="Fechar"
                                    >
                                        <X size={12} className="" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="flex-1 font-mono text-xs font-bold text-[#ff5100] tracking-wider">{shareCode}</span>
                                    <button
                                        onClick={() => copyToClipboard(shareCode)}
                                        className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm text-slate-400 hover:text-[#ff5100] transition-colors"
                                    >
                                        {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                                    Passe este código para outra pessoa importar este fluxo em sua conta.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

const X = ({ size, className }: { size: number, className: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);
