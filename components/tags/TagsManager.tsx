"use client";

import React, { useState } from "react";
import { Search, Tag as TagIcon, Plus, Trash2, Bot, Globe, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTag, deleteTag } from "@/app/actions/tags";

interface TagsManagerProps {
    initialTags: any[];
    bots: any[];
}

export function TagsManager({ initialTags, bots }: TagsManagerProps) {
    const [tags, setTags] = useState(initialTags);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // New Tag State
    const [name, setName] = useState("");
    const [color, setColor] = useState("#ff5100");
    const [botId, setBotId] = useState("global");

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bot?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        const result = await createTag({ name, color, botId });
        setLoading(false);

        if (result.success && result.tag) {
            setTags(prev => [result.tag, ...prev]); // Optimistic update (count will be 0)
            setName("");
            setBotId("global");
            // Ideally re-fetch or assume 0 leads initially
        } else {
            alert(result.error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza? Isso não remove a tag dos leads, apenas da lista de gestão.")) return;

        const result = await deleteTag(id);
        if (result.success) {
            setTags(prev => prev.filter(t => t.id !== id));
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Create Tag Form */}
            <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-0">
                    <h2 className="text-lg font-bold text-[#2d3339] mb-4 flex items-center gap-2">
                        <Plus className="text-[#ff5100]" size={18} />
                        Nova Tag
                    </h2>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Nome da Tag</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: cliente_vip"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Cor da Etiqueta</label>
                            <div className="flex gap-2">
                                {["#ff5100", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#64748b"].map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 transition-all",
                                            color === c ? "border-[#2d3339] scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider ml-1">Escopo</label>
                            <select
                                value={botId}
                                onChange={(e) => setBotId(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#ff5100] focus:ring-4 focus:ring-orange-500/5 outline-none transition-all text-sm font-medium bg-white"
                            >
                                <option value="global">🌐 Global (Todos os Robôs)</option>
                                {bots.map(b => (
                                    <option key={b.id} value={b.id}>🤖 {b.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="w-full bg-[#ff5100] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-[#e64a00] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Criar Tag
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-[#ff5100] outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-3 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Nome da Tag</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#555d66] uppercase tracking-widest">Escopo</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#555d66] uppercase tracking-widest text-center">Leads Marcados</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-[#555d66] uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTags.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm">
                                        Nenhuma tag encontrada.
                                    </td>
                                </tr>
                            )}
                            {filteredTags.map(tag => (
                                <tr key={tag.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: tag.color || "#ccc" }}
                                            />
                                            <span className="text-sm font-bold text-[#2d3339] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                {tag.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {tag.bot ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-blue-50 px-2 py-1 rounded inline-flex w-fit">
                                                <Bot size={12} className="text-blue-500" />
                                                {tag.bot.name}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-purple-50 px-2 py-1 rounded inline-flex w-fit">
                                                <Globe size={12} className="text-purple-500" />
                                                Global
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                                            {tag.count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(tag.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mb-auto"
                                            title="Deletar Tag"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
