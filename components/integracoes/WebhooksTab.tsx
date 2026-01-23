"use client";

import React from "react";
import { Share2, Copy, CheckCircle, ExternalLink, MessageSquare, Tag } from "lucide-react";
import { toast } from "sonner";

export function WebhooksTab() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("URL copiada!");
    };

    const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/external` : "";

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold text-[#2d3339]">Webhooks Externos</h3>
                <p className="text-sm text-[#555d66] font-medium">Conecte plataformas de vendas diretamente ao seu fluxo do Telegram.</p>
            </div>

            {/* URL Section */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                        <Share2 size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-orange-950 mb-1">URL do Webhook Universal</h4>
                        <p className="text-xs text-orange-800 font-medium mb-4">Use esta URL na Hotmart, Kiwify ou PerfectPay para disparar fluxos automaticamente.</p>

                        <div className="flex gap-2">
                            <code className="flex-1 bg-white px-4 py-2.5 rounded-lg border border-orange-200 text-xs font-mono text-orange-900 truncate">
                                {webhookUrl}
                            </code>
                            <button
                                onClick={() => copyToClipboard(webhookUrl)}
                                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-xs font-bold"
                            >
                                <Copy size={14} /> Copiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">1</div>
                    <h5 className="font-bold text-[#2d3339] text-sm mb-2">Configure a Tag</h5>
                    <p className="text-[11px] text-[#555d66] leading-relaxed">No painel da plataforma de vendas, adicione a Tag no parâmetro "Pós-Venda" ou "Etiqueta".</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">2</div>
                    <h5 className="font-bold text-[#2d3339] text-sm mb-2">Receba a Tag</h5>
                    <p className="text-[11px] text-[#555d66] leading-relaxed">Quando a venda for aprovada, o Isy Flow receberá a notificação e aplicará a Tag ao lead.</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">3</div>
                    <h5 className="font-bold text-[#2d3339] text-sm mb-2">Dispare o Fluxo</h5>
                    <p className="text-[11px] text-[#555d66] leading-relaxed">Se existir um fluxo configurado para ser ativado pela Tag recebida, ele será enviado na hora.</p>
                </div>
            </div>

            {/* Platform Guides */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <Tag size={16} className="text-[#555d66]" />
                    <span className="text-xs font-bold text-[#555d66] uppercase tracking-wider">Como configurar por plataforma</span>
                </div>
                <div className="divide-y divide-slate-50">
                    <PlatformRow
                        name="Hotmart"
                        instruction="Vá em 'Ferramentas' > 'Webhook' e cadastre a URL acima para o evento 'Compra Aprovada'."
                    />
                    <PlatformRow
                        name="Kiwify"
                        instruction="Vá em 'Apps' > 'Webhook' e selecione 'Venda Aprovada' enviando para a URL do Isy Flow."
                    />
                    <PlatformRow
                        name="PerfectPay"
                        instruction="Integração via Postback: envie os dados da venda aprovada para este Webhook."
                    />
                </div>
            </div>
        </div>
    );
}

function PlatformRow({ name, instruction }: { name: string, instruction: string }) {
    return (
        <div className="p-5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[#2d3339] font-bold text-[10px] group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors shrink-0">
                {name.charAt(0)}
            </div>
            <div>
                <h6 className="text-[12px] font-bold text-[#2d3339]">{name}</h6>
                <p className="text-[11px] text-[#555d66]">{instruction}</p>
            </div>
        </div>
    );
}
