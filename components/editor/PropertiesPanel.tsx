"use client";

import React from "react";
import { X, Trash2, Settings2, HelpCircle, Plus, Trash } from "lucide-react";

interface PropertiesPanelProps {
    selectedNode: any;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export function PropertiesPanel({ selectedNode, onUpdate, onDelete, onClose }: PropertiesPanelProps) {
    if (!selectedNode) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as any).checked : value;
        onUpdate(selectedNode.id, { ...selectedNode.data, [name]: val });
    };

    const handleButtonChange = (index: number, field: string, value: string) => {
        const buttons = [...(selectedNode.data.buttons || [])];
        buttons[index] = { ...buttons[index], [field]: value };
        onUpdate(selectedNode.id, { ...selectedNode.data, buttons });
    };

    const addButton = () => {
        const buttons = [...(selectedNode.data.buttons || []), { label: "Novo Botão", url: "" }];
        onUpdate(selectedNode.id, { ...selectedNode.data, buttons });
    };

    const removeButton = (index: number) => {
        const buttons = (selectedNode.data.buttons || []).filter((_: any, i: number) => i !== index);
        onUpdate(selectedNode.id, { ...selectedNode.data, buttons });
    };

    const renderFields = () => {
        const type = selectedNode.type;
        const data = selectedNode.data;

        switch (type) {
            case 'TRIGGER':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Tipo de Gatilho</label>
                            <select
                                name="triggerType"
                                title="Tipo de Gatilho"
                                value={data.triggerType || "KEYWORD"}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
                            >
                                <option value="KEYWORD">Palavra-Chave</option>
                                <option value="COMMAND">Comando (/)</option>
                                <option value="TAG">Tag Recebida</option>
                                <option value="NEW_LEAD">Novo Lead / Chat</option>
                            </select>
                        </div>
                        {data.triggerType !== 'NEW_LEAD' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">
                                    {data.triggerType === 'TAG' ? "Nome da Tag" : "Valor do Gatilho"}
                                </label>
                                <input
                                    name="trigger"
                                    title="Valor do Gatilho"
                                    value={data.trigger || ""}
                                    onChange={handleChange}
                                    placeholder={data.triggerType === 'COMMAND' ? "/ajuda" : "Ex: oi, tag_vip"}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 outline-none"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'MESSAGE':
                return (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Texto da Mensagem</label>
                            <textarea
                                name="text"
                                value={data.text || ""}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 outline-none min-h-[120px]"
                                placeholder="Sua mensagem aqui..."
                            />
                        </div>

                        {data.hasButtons && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Botões</label>
                                    <button onClick={addButton} className="text-[#ff5100] text-[10px] font-bold flex items-center gap-1 hover:underline">
                                        <Plus size={12} /> Adicionar
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {(data.buttons || []).map((btn: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative group">
                                            <button
                                                onClick={() => removeButton(idx)}
                                                className="absolute -right-2 -top-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                            <input
                                                value={btn.label}
                                                onChange={(e) => handleButtonChange(idx, 'label', e.target.value)}
                                                placeholder="Texto do Botão"
                                                className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[10px] font-bold outline-none"
                                            />
                                            <input
                                                value={btn.url}
                                                onChange={(e) => handleButtonChange(idx, 'url', e.target.value)}
                                                placeholder="Link/URL (Opcional)"
                                                className="w-full bg-white border border-slate-100 rounded-lg p-2 text-[10px] font-medium outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'IMAGE':
            case 'VIDEO':
            case 'AUDIO':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">URL da Mídia</label>
                            <input
                                name="url"
                                value={data.url || ""}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Legenda (Opcional)</label>
                            <input
                                name="caption"
                                value={data.caption || ""}
                                onChange={handleChange}
                                placeholder="Legenda do arquivo..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 outline-none"
                            />
                        </div>
                    </div>
                );

            case 'DELAY':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">
                                {data.isSmart ? "Tempo Máximo (s)" : "Duração fixa (s)"}
                            </label>
                            <input
                                name="delay"
                                type="number"
                                value={data.delay || 3}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                            />
                            {data.isSmart && <p className="text-[9px] text-slate-400">O atraso inteligente varia com base no tamanho do texto anterior.</p>}
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                            <input
                                type="checkbox"
                                name="showTyping"
                                checked={data.showTyping}
                                onChange={handleChange}
                                className="w-4 h-4 rounded text-[#ff5100] focus:ring-[#ff5100]"
                            />
                            <span className="text-[10px] font-bold text-[#555d66] uppercase tracking-tight">Exibir "Digitando..."</span>
                        </label>
                    </div>
                );

            case 'INPUT':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Nome da Variável</label>
                            <input
                                name="variable"
                                value={data.variable || ""}
                                onChange={handleChange}
                                placeholder="ex: nome_usuario, email"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Tipo de Dado</label>
                            <select
                                name="inputType"
                                title="Tipo de Dado"
                                value={data.inputType || "text"}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
                            >
                                <option value="text">Texto</option>
                                <option value="number">Número</option>
                                <option value="email">E-mail</option>
                                <option value="phone">Telefone</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Tempo de Espera (s)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    name="timeout"
                                    title="Tempo de Espera"
                                    type="number"
                                    value={data.timeout || 60}
                                    onChange={handleChange}
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
                                />
                                <HelpCircle size={14} className="text-slate-300" />
                            </div>
                            <p className="text-[9px] text-slate-400">Se o usuário não responder neste tempo, o caminho de 'Timeout' será seguido.</p>
                        </div>
                    </div>
                );

            case 'ACTION':
                if (data.subType === 'PIX' || data.subType === 'PIX_CUSTOM') {
                    return (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Chave Pix</label>
                                <input
                                    name="pixKey"
                                    value={data.pixKey || ""}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Valor (R$)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    value={data.amount || 0}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
                                />
                            </div>
                        </div>
                    )
                }
                if (data.subType === 'CHECKOUT') {
                    return (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Link do Checkout</label>
                                <input
                                    name="url"
                                    value={data.url || ""}
                                    onChange={handleChange}
                                    placeholder="https://checkout..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none"
                                />
                            </div>
                        </div>
                    )
                }
                if (data.subType === 'END') {
                    return (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-[10px] text-red-600 font-bold uppercase text-center">Encerrar Automação</p>
                            <p className="text-[9px] text-red-500 text-center mt-1">Nenhum bloco seguinte será executado.</p>
                        </div>
                    )
                }
                return (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Webhook / Ação URL</label>
                        <input
                            name="webhook"
                            value={data.webhook || ""}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium outline-none"
                        />
                    </div>
                );

            default:
                return <p className="text-xs text-slate-400">Configure as propriedades deste bloco aqui.</p>;
        }
    };

    return (
        <aside className="w-80 border-l border-slate-100 bg-white flex flex-col animate-in slide-in-from-right-8 duration-300 shadow-xl">
            <div className="h-16 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <Settings2 size={16} className="text-[#ff5100]" />
                    <span className="font-bold text-[#2d3339] text-xs uppercase tracking-wider">Configurações</span>
                </div>
                <button onClick={onClose} title="Fechar" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Node Info */}
                <div className="flex items-center gap-3 p-4 bg-[#fff5f0] border border-orange-100 rounded-xl">
                    <div className="w-8 h-8 bg-[#ff5100] text-white rounded-lg flex items-center justify-center">
                        <Settings2 size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-[#ff5100]">Bloco Selecionado</p>
                        <p className="text-[10px] font-bold text-[#2d3339] uppercase tracking-tight">
                            {selectedNode.type} {selectedNode.data?.subType ? `- ${selectedNode.data.subType}` : ""}
                        </p>
                    </div>
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-6">
                    {renderFields()}
                </div>
            </div>

            <div className="p-6 border-t border-slate-50">
                <button
                    onClick={() => onDelete(selectedNode.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-[#df2020] rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all border border-red-100"
                >
                    <Trash2 size={16} /> Excluir Bloco
                </button>
            </div>
        </aside>
    );
}
