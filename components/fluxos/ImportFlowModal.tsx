"use client";

import React, { useState } from "react";
import { Upload, Link as LinkIcon, Loader2, X, Download } from "lucide-react";
import { importFlow, getFlowByShareCode } from "@/app/actions/flows";
import { useRouter } from "next/navigation";

interface ImportFlowModalProps {
    bots: any[];
}

export function ImportFlowModal({ bots }: ImportFlowModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [botId, setBotId] = useState(bots[0]?.id || "");
    const [method, setMethod] = useState<"FILE" | "LINK">("FILE");
    const [shareCode, setShareCode] = useState("");
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsPending(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const flowData = JSON.parse(event.target?.result as string);
                    const result = await importFlow(botId, flowData);
                    if (result.success) {
                        setIsOpen(false);
                        router.push(`/fluxos/${result.flowId}`);
                    } else {
                        setError(result.error || "Erro ao importar");
                    }
                } catch (err) {
                    setError("Arquivo JSON inválido");
                } finally {
                    setIsPending(false);
                }
            };
            reader.readAsText(file);
        } catch (err) {
            setError("Erro ao ler arquivo");
            setIsPending(false);
        }
    };

    const handleLinkImport = async () => {
        if (!shareCode) return;
        setIsPending(true);
        setError(null);

        try {
            const flowData = await getFlowByShareCode(shareCode);
            if (!flowData) {
                setError("Código de compartilhamento inválido");
                setIsPending(false);
                return;
            }

            const result = await importFlow(botId, flowData);
            if (result.success) {
                setIsOpen(false);
                router.push(`/fluxos/${result.flowId}`);
            } else {
                setError(result.error || "Erro ao importar");
            }
        } catch (err) {
            setError("Erro ao buscar fluxo");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:bg-slate-50 hover:scale-[1.02] active:scale-95"
            >
                <Download size={18} />
                Importar
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d3339]/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label="Fechar"
                            title="Fechar"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#2d3339]">Importar Fluxo</h2>
                            <p className="text-sm text-[#555d66]">Adicione um fluxo via arquivo ou link.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Conectar ao Bot
                                </label>
                                <select
                                    id="bot-select"
                                    value={botId}
                                    onChange={(e) => setBotId(e.target.value)}
                                    title="Selecione o Bot"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                                >
                                    {bots.map(bot => (
                                        <option key={bot.id} value={bot.id}>
                                            @{bot.username || bot.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setMethod("FILE")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${method === "FILE" ? "bg-white text-[#ff5100] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <Upload size={14} /> Arquivo JSON
                                </button>
                                <button
                                    onClick={() => setMethod("LINK")}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${method === "LINK" ? "bg-white text-[#ff5100] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                    <LinkIcon size={14} /> Link/Código
                                </button>
                            </div>

                            {method === "FILE" ? (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50/50 group hover:border-[#ff5100]/30 transition-all cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleFileChange}
                                            disabled={isPending}
                                            title="Selecionar arquivo JSON"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-[#ff5100] shadow-sm transition-all">
                                            <Upload size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-600">Clique para selecionar</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Arquivos .json exportados do IsyFlow</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Código de Compartilhamento
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={shareCode}
                                                onChange={(e) => setShareCode(e.target.value)}
                                                placeholder="Cole o código aqui..."
                                                title="Código de Compartilhamento"
                                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all font-medium text-sm"
                                            />
                                            <button
                                                onClick={handleLinkImport}
                                                disabled={isPending || !shareCode}
                                                className="px-6 bg-[#ff5100] text-white rounded-xl font-bold text-sm hover:bg-[#e64a00] transition-all disabled:opacity-50"
                                            >
                                                {isPending ? <Loader2 size={18} className="animate-spin" /> : "Importar"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
                            )}

                            {isPending && method === "FILE" && (
                                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                                    <Loader2 size={18} className="animate-spin text-[#ff5100]" />
                                    Processando arquivo...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
