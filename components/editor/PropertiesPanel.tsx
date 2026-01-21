"use client";

import React from "react";
import { X, Trash2, Settings2, HelpCircle } from "lucide-react";

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

    return (
        <aside className="w-80 border-l border-slate-100 bg-white flex flex-col animate-in slide-in-from-right-8 duration-300 shadow-xl">
            <div className="h-16 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-slate-50/30">
                <div className="flex items-center gap-2">
                    <Settings2 size={16} className="text-[#ff5100]" />
                    <span className="font-bold text-[#2d3339] text-xs uppercase tracking-wider">Configurações</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Node Type Info */}
                <div className="flex items-center gap-3 p-4 bg-[#fff5f0] border border-orange-100 rounded-xl">
                    <div className="w-8 h-8 bg-[#ff5100] text-white rounded-lg flex items-center justify-center">
                        <Settings2 size={16} />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-[#ff5100]">Tipo de Bloco</p>
                        <p className="text-sm font-bold text-[#2d3339] uppercase tracking-tight">{selectedNode.type}</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-6">
                    {(selectedNode.type === 'message' || selectedNode.type === 'trigger') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider flex items-center gap-2">
                                Conteúdo da Mensagem <HelpCircle size={10} />
                            </label>
                            <textarea
                                name={selectedNode.type === 'trigger' ? "trigger" : "text"}
                                value={selectedNode.type === 'trigger' ? selectedNode.data.trigger : selectedNode.data.text}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-2 ring-[#ff5100]/20 focus:border-[#ff5100] outline-none transition-all min-h-[120px]"
                                placeholder="Digite sua mensagem aqui..."
                            />
                        </div>
                    )}

                    {selectedNode.type === 'media' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Tipo de Mídia</label>
                                <select
                                    name="mediaType"
                                    value={selectedNode.data.mediaType || "image"}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none focus:border-[#ff5100]"
                                >
                                    <option value="image">Imagem (.jpg/png)</option>
                                    <option value="video">Vídeo (.mp4)</option>
                                    <option value="audio">Áudio (.mp3)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">URL do Arquivo</label>
                                <input
                                    name="url"
                                    value={selectedNode.data.url || ""}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium outline-none focus:border-[#ff5100]"
                                    placeholder="https://suaimagem.com/bot.jpg"
                                />
                            </div>
                        </div>
                    )}

                    {selectedNode.type === 'delay' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider">Tempo de Espera (s)</label>
                                <input
                                    name="delay"
                                    type="number"
                                    value={selectedNode.data.delay || 3}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-bold outline-none focus:border-[#ff5100]"
                                />
                            </div>
                            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-white transition-all">
                                <input
                                    type="checkbox"
                                    name="showTyping"
                                    checked={selectedNode.data.showTyping || false}
                                    onChange={(e) => onUpdate(selectedNode.id, { ...selectedNode.data, showTyping: e.target.checked })}
                                    className="w-4 h-4 rounded border-[#ff5100]/30 text-[#ff5100] focus:ring-[#ff5100]"
                                />
                                <span className="text-[10px] font-bold text-[#555d66] uppercase tracking-tight">Ativar "Digitando..."</span>
                            </label>
                        </div>
                    )}
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
