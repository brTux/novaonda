"use client";

import { useState } from "react";
import { CreditCard, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { savePaymentCredential } from "@/app/actions/payments";

interface PaymentSettingsFormProps {
    initialCredentials: any[];
}

export function PaymentSettingsForm({ initialCredentials }: PaymentSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const pushinpayCred = initialCredentials.find(c => c.provider === 'PUSHINPAY');
    const [pushinpayToken, setPushinpayToken] = useState(pushinpayCred?.token || "");

    const handleSave = async (provider: 'PUSHINPAY') => {
        setLoading(true);
        setMessage(null);
        try {
            const token = provider === 'PUSHINPAY' ? pushinpayToken : "";
            if (!token) throw new Error("Token é obrigatório");

            await savePaymentCredential(provider, token);
            setMessage({ type: 'success', text: "Configurações salvas com sucesso!" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Erro ao salvar configurações" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">PushinPay</h3>
                            <p className="text-xs text-gray-500">Integração nativa para PIX</p>
                        </div>
                    </div>
                    <a
                        href="https://pushinpay.com.br"
                        target="_blank"
                        className="text-xs text-orange-600 font-medium flex items-center gap-1 hover:underline"
                    >
                        Criar conta <ExternalLink size={12} />
                    </a>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">API Token (Bearer)</label>
                        <input
                            type="password"
                            value={pushinpayToken}
                            onChange={(e) => setPushinpayToken(e.target.value)}
                            placeholder="pp_live_..."
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                        />
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Shield size={10} /> Suas chaves são armazenadas de forma segura.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => handleSave('PUSHINPAY')}
                            disabled={loading}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
                        >
                            {loading ? "Salvando..." : "Salvar Configurações"}
                            {!loading && <CheckCircle size={16} />}
                        </button>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-xs font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                    <CreditCard size={24} />
                </div>
                <h4 className="text-sm font-bold text-gray-700">Mais Gateways em Breve</h4>
                <p className="text-xs text-gray-500 max-w-[200px] mt-1">Estamos trabalhando para integrar Asaas e Mercado Pago.</p>
            </div>
        </div>
    );
}
