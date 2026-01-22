"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Save, ChevronLeft, Smartphone, Monitor, ChevronRight,
    Trash2, GripVertical, Settings, Rocket, HelpCircle, MousePointer2,
    ArrowUp, ArrowDown, Image as ImageIcon, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { updatePressell } from "@/app/actions/marketing";
import { useRouter } from "next/navigation";

interface Block {
    id: string;
    type: "VSL" | "QUIZ" | "BUTTON" | "TEXT" | "IMAGE";
    content: any;
}

interface PressellBuilderClientProps {
    pressell: any;
}

export default function PressellBuilderClient({ pressell }: PressellBuilderClientProps) {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>(pressell.config || []);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"layout" | "settings">("layout");
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    // Initial default blocks if empty
    useEffect(() => {
        if (blocks.length === 0) {
            setBlocks([
                { id: "1", type: "TEXT", content: { text: "Título Irresistível Aqui", size: "lg", color: "#2d3339" } },
                { id: "2", type: "VSL", content: { url: pressell.vslUrl } },
                { id: "3", type: "BUTTON", content: { text: pressell.buttonText, color: "#ff5100" } }
            ]);
        }
    }, []);

    const addBlock = (type: Block["type"]) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: getInitialContent(type)
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const getInitialContent = (type: Block["type"]) => {
        switch (type) {
            case "TEXT": return { text: "Texto novo...", size: "md", color: "#555d66" };
            case "BUTTON": return { text: "Clique aqui", color: "#ff5100" };
            case "VSL": return { url: "https://youtube.com/..." };
            case "QUIZ": return {
                question: "Pergunta do Quiz?",
                options: ["Opção 1", "Opção 2", "Opção 3"]
            };
            case "IMAGE": return { url: "" };
            default: return {};
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePressell(pressell.id, { config: blocks });
            alert("Pressell salva com sucesso!");
        } catch (err) {
            alert("Erro ao salvar: " + err);
        } finally {
            setIsSaving(false);
        }
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const updateBlockContent = (id: string, newContent: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
    };

    const moveBlock = (id: string, direction: "up" | "down") => {
        const index = blocks.findIndex(b => b.id === id);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/ferramentas/pressel" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                        <ChevronLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-[#2d3339]">Construtor de Pressell</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pressell.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1">
                        <button className="p-1 px-3 text-[10px] font-bold text-[#2d3339] bg-white rounded shadow-sm flex items-center gap-1.5">
                            <Smartphone size={12} /> Mobile
                        </button>
                        <button className="p-1 px-3 text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Monitor size={12} /> Desktop
                        </button>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-[#ff5100] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 hover:bg-[#e64a00] transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar Projeto
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Options */}
                <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Modelos de Layout</h3>
                            <div className="space-y-3">
                                <button className="w-full p-4 rounded-xl border border-orange-500/20 bg-orange-50/30 flex items-center gap-3 text-left group transition-all hover:bg-orange-50 hover:border-orange-500/40">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                                        <HelpCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#2d3339]">Quiz Interativo</p>
                                        <p className="text-[9px] text-[#ff5100] font-bold">Alta Retenção</p>
                                    </div>
                                </button>
                                <button className="w-full p-4 rounded-xl border border-slate-100 bg-white flex items-center gap-3 text-left group transition-all hover:border-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center">
                                        <MousePointer2 size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#2d3339]">Botão com Oferta</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Conversão Direta</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Componentes</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { type: "TEXT", label: "Texto", icon: <Rocket size={16} /> },
                                    { type: "VSL", label: "Vídeo VSL", icon: <Rocket size={16} /> },
                                    { type: "QUIZ", label: "Quiz", icon: <HelpCircle size={16} /> },
                                    { type: "BUTTON", label: "Botão", icon: <MousePointer2 size={16} /> },
                                    { type: "IMAGE", label: "Imagem", icon: <Smartphone size={16} /> },
                                ].map(comp => (
                                    <button
                                        key={comp.type}
                                        onClick={() => addBlock(comp.type as any)}
                                        className="p-4 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-2 group hover:border-[#ff5100] hover:bg-orange-50/20 transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-[#ff5100] group-hover:text-white transition-all">
                                            {comp.icon}
                                        </div>
                                        <span className="text-[10px] font-bold text-[#555d66]">{comp.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Center - Preview */}
                <main className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-12">
                    <div className="w-[375px] h-[760px] bg-slate-950 rounded-[50px] border-[8px] border-slate-900 shadow-2xl overflow-hidden relative group">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-2xl z-20"></div>

                        <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 pt-12 space-y-4">
                            {blocks.map((block, idx) => (
                                <div
                                    key={block.id}
                                    onClick={() => setSelectedBlockId(block.id)}
                                    className={cn(
                                        "relative border-2 border-transparent transition-all cursor-pointer rounded-xl hover:border-[#ff5100]/30",
                                        selectedBlockId === block.id && "border-[#ff5100] ring-4 ring-[#ff5100]/10"
                                    )}
                                >
                                    <BlockRenderer block={block} />

                                    {selectedBlockId === block.id && (
                                        <div className="absolute -top-3 -right-3 flex gap-1 z-30">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                                                className="w-8 h-8 rounded-full bg-white text-slate-600 shadow-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
                                                disabled={idx === 0}
                                                title="Mover para cima"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                                                className="w-8 h-8 rounded-full bg-white text-slate-600 shadow-lg flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
                                                disabled={idx === blocks.length - 1}
                                                title="Mover para baixo"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                className="w-8 h-8 rounded-full bg-white text-red-500 shadow-lg flex items-center justify-center hover:bg-red-50"
                                                title="Remover bloco"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0 overflow-y-auto p-6">
                    {selectedBlockId ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings size={16} className="text-[#ff5100]" />
                                <h3 className="text-sm font-bold text-[#2d3339]">Propriedades do Bloco</h3>
                            </div>

                            <BlockSettings
                                block={blocks.find(b => b.id === selectedBlockId)!}
                                onUpdate={(content) => updateBlockContent(selectedBlockId, content)}
                            />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <Rocket size={40} className="text-slate-200 mb-4" />
                            <p className="text-sm font-medium text-slate-400">Selecione um bloco para editar suas propriedades.</p>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}

function BlockRenderer({ block }: { block: Block }) {
    switch (block.type) {
        case "TEXT":
            return (
                <p className={cn(
                    "text-center font-black leading-tight",
                    block.content.size === "lg" ? "text-xl" : "text-sm"
                )} style={{ color: block.content.color }}>
                    {block.content.text}
                </p>
            );
        case "VSL":
            return (
                <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center text-[10px] text-slate-600">
                    {block.content.url ? "[VÍDEO VSL]" : "[ADICIONE A URL DO VÍDEO]"}
                </div>
            );
        case "QUIZ":
            return (
                <div className="space-y-3">
                    <p className="text-center text-xs font-bold text-slate-300">{block.content.question}</p>
                    <div className="space-y-2">
                        {block.content.options.map((opt: string, i: number) => (
                            <div key={i} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] font-bold flex items-center justify-between">
                                <span>{opt}</span>
                                <ChevronRight size={12} className="text-[#ff5100]" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        case "BUTTON":
            return (
                <button className="w-full py-4 rounded-2xl font-black text-xs text-white shadow-xl shadow-orange-500/20" style={{ backgroundColor: block.content.color }}>
                    {block.content.text}
                </button>
            );
        case "IMAGE":
            return (
                <div className="w-full rounded-xl overflow-hidden border border-white/10">
                    {block.content.url ? (
                        <img src={block.content.url} alt="Componente" className="w-full h-auto object-cover" />
                    ) : (
                        <div className="aspect-video bg-slate-900 flex items-center justify-center text-[10px] text-slate-600">
                            [ADICIONE A URL DA IMAGEM]
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
}

function BlockSettings({ block, onUpdate }: { block: Block, onUpdate: (content: any) => void }) {
    return (
        <div className="space-y-4">
            {block.type === "TEXT" && (
                <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Conteúdo do Texto</label>
                        <textarea
                            value={block.content.text}
                            onChange={(e) => onUpdate({ text: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm h-24"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Tamanho</label>
                        <select
                            value={block.content.size}
                            onChange={(e) => onUpdate({ size: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                        >
                            <option value="md">Normal</option>
                            <option value="lg">Grande / Título</option>
                        </select>
                    </div>
                </>
            )}

            {block.type === "VSL" && (
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">URL do Vídeo (Youtube ou Vturb)</label>
                    <input
                        type="text"
                        value={block.content.url}
                        onChange={(e) => onUpdate({ url: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                    />
                </div>
            )}

            {block.type === "QUIZ" && (
                <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Pergunta</label>
                        <input
                            type="text"
                            value={block.content.question}
                            onChange={(e) => onUpdate({ question: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Opções</label>
                        {block.content.options.map((opt: string, i: number) => (
                            <input
                                key={i}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...block.content.options];
                                    newOpts[i] = e.target.value;
                                    onUpdate({ options: newOpts });
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-100 text-xs"
                                title={`Opção ${i + 1}`}
                                placeholder={`Opção ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {block.type === "BUTTON" && (
                <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Texto do Botão</label>
                        <input
                            type="text"
                            value={block.content.text}
                            onChange={(e) => onUpdate({ text: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Cor do Botão</label>
                        <input
                            type="color"
                            value={block.content.color}
                            onChange={(e) => onUpdate({ color: e.target.value })}
                            className="w-full h-10 p-1 rounded-lg border border-slate-200 cursor-pointer"
                        />
                    </div>
                </>
            )}

            {block.type === "IMAGE" && (
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">URL da Imagem</label>
                    <input
                        type="text"
                        value={block.content.url}
                        onChange={(e) => onUpdate({ url: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5100] outline-none transition-all text-sm"
                        placeholder="https://..."
                    />
                </div>
            )}
        </div>
    );
}


