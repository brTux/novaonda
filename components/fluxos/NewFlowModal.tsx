"use client";

import React, { useState, useActionState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { createFlow } from "@/app/actions/flows";
import { useRouter } from "next/navigation";

interface NewFlowModalProps {
    bots: any[];
}

export function NewFlowModal({ bots }: NewFlowModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    async function handleSubmit(prevState: any, formData: FormData) {
        const name = formData.get("name") as string;
        const botId = formData.get("botId") as string;

        if (!name) return { error: "Nome é obrigatório" };
        if (!botId) return { error: "Selecione um bot" };

        const result = await createFlow(name, botId);
        if (result.success && result.flowId) {
            setIsOpen(false);
            router.push(`/fluxos/${result.flowId}`);
            return { success: true };
        }
        return { error: result.error || "Erro ao criar fluxo" };
    }

    const [state, action, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:bg-[#e64a00] hover:scale-[1.02] active:scale-95 shadow-[#ff5100]/10"
            >
                <Plus size={18} />
                Novo Fluxo
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d3339]/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#2d3339]">Novo Fluxo</h2>
                            <p className="text-sm text-[#555d66]">Dê um nome para sua nova automação.</p>
                        </div>

                        <form action={action} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Nome do Fluxo
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    autoFocus
                                    placeholder="Ex: Boas-vindas, Recuperação..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all font-medium text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Conectar ao Bot
                                </label>
                                <select
                                    name="botId"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                                    defaultValue={bots[0]?.id || ""}
                                >
                                    {bots.length === 0 && (
                                        <option value="">Nenhum bot encontrado</option>
                                    )}
                                    {bots.map(bot => (
                                        <option key={bot.id} value={bot.id}>
                                            @{bot.username || bot.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {state?.error && (
                                <p className="text-red-500 text-xs font-bold">{state.error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all font-primary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending || bots.length === 0}
                                    className="flex-1 py-3 bg-[#ff5100] text-white rounded-xl font-bold text-sm hover:bg-[#e64a00] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-primary"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Criando...
                                        </>
                                    ) : (
                                        "Criar e Editar"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
