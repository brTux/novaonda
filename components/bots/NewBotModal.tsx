"use client";

import { useState, useActionState } from "react";
import { Plus, X, Loader2, Link } from "lucide-react";
import { addBot } from "@/app/actions/bots";

export function NewBotModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, isPending] = useActionState(addBot, null);

    // Close modal on success
    if (state?.success && isOpen) {
        setIsOpen(false);
        // Optional: Toast notification here
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-[#ff5100] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:bg-[#e64a00] hover:scale-[1.02] active:scale-95 shadow-[#ff5100]/10"
            >
                <Plus size={18} />
                Conectar Novo Bot
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d3339]/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col gap-1 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#ff5100]/10 flex items-center justify-center text-[#ff5100] mb-2">
                                <Link size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-[#2d3339]">Conectar Telegram</h2>
                            <p className="text-sm text-[#555d66]">Insira o token gerado pelo @BotFather.</p>
                        </div>

                        <form action={action} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#555d66] uppercase mb-1.5 ml-1">Token do Bot</label>
                                <input
                                    name="token"
                                    type="text"
                                    placeholder="Ex: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#2d3339] font-medium outline-none focus:border-[#ff5100] focus:ring-2 focus:ring-[#ff5100]/10 transition-all placeholder:text-slate-400"
                                    required
                                />
                                {state?.errors?.token && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">{state.errors.token[0]}</p>
                                )}
                            </div>

                            {state?.message && !state.success && (
                                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-bold border border-red-100">
                                    {state.message}
                                </div>
                            )}

                            {state?.success && (
                                <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-lg font-bold border border-emerald-100">
                                    {state.message}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 py-3 bg-[#ff5100] text-white rounded-xl font-bold text-sm hover:bg-[#e64a00] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Verificando...
                                        </>
                                    ) : (
                                        "Conectar Bot"
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
