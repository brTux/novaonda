"use client";

import React, { useState } from "react";
import { X, Send, AlertCircle, Loader2 } from "lucide-react";
import { createCampaign } from "@/app/actions/campaigns";
import { cn } from "@/lib/utils";

interface NewCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    bots: any[];
    flows: any[];
    availableTags?: any[];
}

export default function NewCampaignModal({ isOpen, onClose, bots, flows, availableTags = [] }: NewCampaignModalProps) {
    const [name, setName] = useState("");
    const [targetRange, setTargetRange] = useState<"all" | "specific">("specific");
    const [selectedBotIds, setSelectedBotIds] = useState<string[]>([]);
    const [includeTagsStr, setIncludeTagsStr] = useState("");
    const [excludeTagsStr, setExcludeTagsStr] = useState("");
    const [flowId, setFlowId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper for suggestions
    const renderTagSuggestions = (currentStr: string, setStr: (s: string) => void, colorClass: string) => {
        const currentTags = currentStr.split(",").map(t => t.trim()).filter(Boolean);
        const lastPart = currentStr.split(",").pop()?.trim().toLowerCase() || "";

        if (!lastPart) return null;

        const suggestions = availableTags.filter((t: any) =>
            t.name.toLowerCase().includes(lastPart) &&
            !currentTags.includes(t.name) &&
            (!t.botId || selectedBotIds.includes(t.botId) || selectedBotIds.length === 0)
        ).slice(0, 5);

        if (suggestions.length === 0) return null;

        return (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((t: any) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                            const parts = currentStr.split(",");
                            parts.pop(); // Remove partial
                            parts.push(t.name);
                            setStr(parts.join(", ") + ", ");
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.name}
                    </button>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const includeTags = includeTagsStr.split(",").map(t => t.trim()).filter(Boolean);
        const excludeTags = excludeTagsStr.split(",").map(t => t.trim()).filter(Boolean);

        if (!name || (targetRange === "specific" && selectedBotIds.length === 0) || !flowId) {
            setError("Por favor, preencha os campos obrigatórios.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await createCampaign({
                name,
                botIds: targetRange === "specific" ? selectedBotIds : undefined,
                targetAllBots: targetRange === "all",
                includeTags,
                excludeTags,
                flowId
            });
            if (result.success) {
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "Erro ao criar campanha.");
        } finally {
            setLoading(false);
        }
    }

    const toggleBot = (id: string) => {
        setSelectedBotIds(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-[#2d3339]">Nova Campanha</h2>
                        <p className="text-xs text-[#555d66]">Configure seu disparo segmentado.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5 focus-within:text-[#ff5100] transition-colors">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Nome da Campanha</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Oferta Relâmpago VIP"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                            title="Nome da Campanha"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Alcance do Disparo</label>
                            <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setTargetRange("all")}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                        targetRange === "all" ? "bg-white text-[#ff5100] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Todos os Bots
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetRange("specific")}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                        targetRange === "specific" ? "bg-white text-[#ff5100] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Bots Específicos
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Fluxo de Destino</label>
                            <select
                                value={flowId}
                                onChange={(e) => setFlowId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium bg-white"
                                title="Fluxo de Destino"
                            >
                                <option value="">Escolha um fluxo...</option>
                                {flows.filter(f => selectedBotIds.length === 0 || selectedBotIds.includes(f.botId)).map(flow => (
                                    <option key={flow.id} value={flow.id}>{flow.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {targetRange === "specific" && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Selecionar Robôs</label>
                            <div className="grid grid-cols-2 gap-2">
                                {bots.map(bot => (
                                    <button
                                        key={bot.id}
                                        type="button"
                                        onClick={() => toggleBot(bot.id)}
                                        className={cn(
                                            "px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all flex items-center gap-2",
                                            selectedBotIds.includes(bot.id)
                                                ? "bg-orange-50 border-orange-200 text-orange-600"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-3 h-3 rounded-full border flex items-center justify-center",
                                            selectedBotIds.includes(bot.id) ? "border-orange-500 bg-orange-500" : "border-slate-300"
                                        )}>
                                            {selectedBotIds.includes(bot.id) && <div className="w-1 h-1 bg-white rounded-full" />}
                                        </div>
                                        {bot.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-2 border-t border-slate-50">
                        <div className="space-y-1.5 relative">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide ml-1">Incluir Tags</label>
                                <span className="text-[9px] text-slate-400 font-medium">Opcional (separe por vírgulas)</span>
                            </div>
                            <input
                                type="text"
                                value={includeTagsStr}
                                onChange={(e) => setIncludeTagsStr(e.target.value)}
                                placeholder="venda_confirmada, lead_quente"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-medium"
                                title="Incluir Tags"
                            />
                            {renderTagSuggestions(includeTagsStr, setIncludeTagsStr, "emerald")}
                        </div>

                        <div className="space-y-1.5 relative">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-red-500 uppercase tracking-wide ml-1">Excluir Tags</label>
                                <span className="text-[9px] text-slate-400 font-medium">Opcional (separe por vírgulas)</span>
                            </div>
                            <input
                                type="text"
                                value={excludeTagsStr}
                                onChange={(e) => setExcludeTagsStr(e.target.value)}
                                placeholder="reembolsado, blacklisted"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 outline-none transition-all text-sm font-medium"
                                title="Excluir Tags"
                            />
                            {renderTagSuggestions(excludeTagsStr, setExcludeTagsStr, "red")}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff5100] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-[#e64a00] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Criar Campanha e Segmentar Base
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
