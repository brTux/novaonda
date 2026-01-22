"use client";

import React, { useState } from "react";
import { X, Rocket, AlertCircle, Loader2 } from "lucide-react";
import { createPressell } from "@/app/actions/marketing";

interface NewPressellModalProps {
    isOpen: boolean;
    onClose: () => void;
    bots: any[];
    onCreated: (newPressell: any) => void;
}

export default function NewPressellModal({ isOpen, onClose, bots, onCreated }: NewPressellModalProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [vslUrl, setVslUrl] = useState("");
    const [buttonText, setButtonText] = useState("Continuar no Telegram");
    const [botId, setBotId] = useState("");
    const [pixelId, setPixelId] = useState("");
    const [safeUrl, setSafeUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !slug || !vslUrl || !botId) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await createPressell({
                title: name,
                slug: slug.toLowerCase().replace(/\s+/g, '-'),
                vslUrl,
                buttonText,
                botId,
                pixelId,
                safeUrl
            });
            if (result.success) {
                // Find selected bot for initial display
                const selectedBot = bots.find(b => b.id === botId);
                onCreated({ ...result.pressell, bot: selectedBot });
                onClose();
            }
        } catch (err: any) {
            setError(err.message || "Erro ao criar Pressell.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-[#2d3339]">Nova Pressell</h2>
                        <p className="text-xs text-[#555d66]">Configure sua landing page rápida.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-auto">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                            <AlertCircle size={14} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Título da Página</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Oferta Exclusiva"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                            title="Título da Página"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Slug da URL (seusite.com/p/...)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="ex-oferta-carnaval"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm font-mono"
                            title="Slug da URL"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">URL do Vídeo (VSL)</label>
                        <input
                            type="text"
                            value={vslUrl}
                            onChange={(e) => setVslUrl(e.target.value)}
                            placeholder="Link do Youtube ou Vturb (iframe)"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                            title="URL do Vídeo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Robô Destino</label>
                            <select
                                value={botId}
                                onChange={(e) => setBotId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm bg-white"
                                title="Robô Destino"
                            >
                                <option value="">Escolha...</option>
                                {bots.map(bot => (
                                    <option key={bot.id} value={bot.id}>{bot.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Meta Pixel ID</label>
                            <input
                                type="text"
                                value={pixelId}
                                onChange={(e) => setPixelId(e.target.value)}
                                placeholder="0000000000"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                                title="Meta Pixel ID"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">URL Branca (URL de Segurança / Cloaking)</label>
                        <input
                            type="text"
                            value={safeUrl}
                            onChange={(e) => setSafeUrl(e.target.value)}
                            placeholder="https://google.com ou link seguro"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                            title="URL Branca"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Texto do Botão CTA</label>
                        <input
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                            title="Texto do Botão"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff5100] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-[#e64a00] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                            Lançar Pressell
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
