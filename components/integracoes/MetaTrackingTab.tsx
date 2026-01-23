"use client";

import React, { useState } from "react";
import { Facebook, Key, Activity, Bot as BotIcon, CheckCircle2, Save, Loader2 } from "lucide-react";
import { updateBotMarketing } from "@/app/actions/marketing";
import { toast } from "sonner";

interface MetaTrackingTabProps {
    bots: any[];
}

export function MetaTrackingTab({ bots }: MetaTrackingTabProps) {
    const [savingId, setSavingId] = useState<string | null>(null);

    const handleSave = async (botId: string, formData: any) => {
        setSavingId(botId);
        try {
            const result = await updateBotMarketing(botId, formData);
            if (result.success) {
                toast.success("Configurações atualizadas!");
            } else {
                toast.error(result.message || "Erro ao salvar");
            }
        } catch (error) {
            toast.error("Erro interno");
        } finally {
            setSavingId(null);
        }
    };

    if (bots.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <BotIcon size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Nenhum bot encontrado</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">Você precisa conectar um bot do Telegram antes de configurar o rastreamento da Meta.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-8">
            {bots.map((bot) => (
                <BotMarketingCard
                    key={bot.id}
                    bot={bot}
                    isSaving={savingId === bot.id}
                    onSave={(data) => handleSave(bot.id, data)}
                />
            ))}
        </div>
    );
}

function BotMarketingCard({ bot, isSaving, onSave }: { bot: any, isSaving: boolean, onSave: (data: any) => void }) {
    const [pixelId, setPixelId] = useState(bot.pixelId || "");
    const [capiToken, setCapiToken] = useState(bot.capiToken || "");
    const [testEventCode, setTestEventCode] = useState(bot.testEventCode || "");

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#ff5100]">
                    <BotIcon size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#2d3339]">{bot.name}</h3>
                    <p className="text-xs text-[#555d66] font-medium">@{bot.username}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {(bot.pixelId && bot.capiToken) ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} />
                            Rastreamento Ativo
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                            <Activity size={12} />
                            Aguardando Configuração
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider flex items-center gap-2">
                        <Facebook size={12} /> Meta Pixel ID
                    </label>
                    <input
                        type="text"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        placeholder="Ex: 123456789012345"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5100]/20 transition-all font-medium text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider flex items-center gap-2">
                        <Key size={12} /> API de Conversões (Token)
                    </label>
                    <input
                        type="password"
                        value={capiToken}
                        onChange={(e) => setCapiToken(e.target.value)}
                        placeholder="EAAB..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5100]/20 transition-all font-medium text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} /> Código de Teste (Opcional)
                    </label>
                    <input
                        type="text"
                        value={testEventCode}
                        onChange={(e) => setTestEventCode(e.target.value)}
                        placeholder="TEST1234..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5100]/20 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end">
                <button
                    onClick={() => onSave({ pixelId, capiToken, testEventCode })}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-[#ff5100]/10 hover:bg-[#e64a00] transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Salvar Configurações
                </button>
            </div>
        </div>
    );
}
