"use client";

import React, { useState } from "react";
import { X, Send, AlertCircle, Loader2 } from "lucide-react";
import { createCampaign } from "@/app/actions/campaigns";

interface NewCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    bots: any[];
    flows: any[];
}

export default function NewCampaignModal({ isOpen, onClose, bots, flows }: NewCampaignModalProps) {
    const [name, setName] = useState("");
    const [botId, setBotId] = useState("");
    const [flowId, setFlowId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !botId || !flowId) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await createCampaign({ name, botId, flowId });
            if (result.success) {
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "Erro ao criar campanha.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-[#2d3339]">Nova Campanha</h2>
                        <p className="text-xs text-[#555d66]">Configure seu disparo em massa.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Nome da Campanha</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Oferta de Carnaval"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                            title="Nome da Campanha"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Selecionar Robô</label>
                        <select
                            value={botId}
                            onChange={(e) => setBotId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium bg-white"
                            title="Selecionar Robô"
                        >
                            <option value="">Escolha um robô...</option>
                            {bots.map(bot => (
                                <option key={bot.id} value={bot.id}>{bot.name}</option>
                            ))}
                        </select>
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
                            {flows.filter(f => f.botId === botId || !botId).map(flow => (
                                <option key={flow.id} value={flow.id}>{flow.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff5100] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-[#e64a00] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Criar e Preparar Fila
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
