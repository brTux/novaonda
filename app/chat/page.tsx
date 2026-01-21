"use client";

import React, { useState } from "react";
import { Search, Send, Bot, Phone, MoreVertical, Paperclip, Smile, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex-1 flex overflow-hidden bg-white animate-in fade-in duration-500">
            {/* Compact Sidebar */}
            <aside className={cn(
                "fixed inset-y-16 lg:relative lg:inset-y-0 w-72 border-r border-slate-100 flex flex-col bg-slate-50/30 z-30 transition-transform duration-300",
                !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0"
            )}>
                <div className="p-4 space-y-3">
                    <h1 className="text-sm font-bold text-[#2d3339]">Chat ao Vivo</h1>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-medium focus:ring-1 ring-[#ff5100]/20 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <button
                            key={i}
                            className={cn(
                                "w-full p-2.5 rounded-lg flex items-center gap-2.5 transition-all text-left",
                                i === 1 ? "bg-white shadow-sm border border-slate-100" : "hover:bg-white/60"
                            )}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#2d3339] font-bold text-[10px] shrink-0">
                                {i === 1 ? "JS" : i === 2 ? "MA" : "CL"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-bold text-[#2d3339] text-[11px] truncate">Usuário {i}</span>
                                    <span className="text-[9px] text-slate-400">12:45</span>
                                </div>
                                <p className="text-[10px] text-[#555d66] truncate font-medium">Olá, gostaria de saber...</p>
                            </div>
                            {i === 1 && <div className="w-1.5 h-1.5 bg-[#ff5100] rounded-full shrink-0" />}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative">
                {/* Compact Header */}
                <header className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-1.5 text-[#2d3339] hover:bg-slate-50 rounded-lg"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu size={18} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#ff5100] flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                            JS
                        </div>
                        <div>
                            <h2 className="font-bold text-[#2d3339] text-xs">João Silva</h2>
                            <p className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 text-[#555d66] hover:text-[#2d3339] transition-all rounded-lg hover:bg-slate-50">
                            <Phone size={16} />
                        </button>
                        <button className="p-1.5 text-[#555d66] hover:text-[#2d3339] transition-all rounded-lg hover:bg-slate-50">
                            <MoreVertical size={16} />
                        </button>
                    </div>
                </header>

                {/* Compact Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-center">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-[#555d66] rounded-full text-[9px] font-bold uppercase tracking-wider">Hoje</span>
                    </div>

                    {/* Bot Message */}
                    <div className="flex gap-2 items-start max-w-[80%]">
                        <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100] shrink-0 border border-orange-100">
                            <Bot size={13} />
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl rounded-tl-none border border-slate-100 shadow-sm">
                            <p className="text-xs text-[#2d3339] leading-relaxed font-medium">Olá! Eu sou o assistente virtual da Nova Onda. Como posso ajudar com sua dúvida hoje?</p>
                            <span className="text-[8px] text-[#555d66] font-bold mt-1.5 block opacity-50">12:30</span>
                        </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-2 items-start justify-end ml-auto max-w-[80%]">
                        <div className="bg-[#ff5100] p-3 rounded-xl rounded-tr-none shadow-md shadow-[#ff5100]/10">
                            <p className="text-xs text-white leading-relaxed font-medium">Gostaria de falar com um atendente humano, por favor.</p>
                            <span className="text-[8px] text-orange-200 font-bold mt-1.5 block text-right opacity-80">12:35</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2d3339] shrink-0 font-bold text-[9px]">
                            JS
                        </div>
                    </div>
                </div>

                {/* Compact Input */}
                <footer className="p-3 bg-white border-t border-slate-100">
                    <div className="max-w-4xl mx-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 focus-within:ring-1 ring-[#ff5100]/10 focus-within:border-[#ff5100] transition-all shadow-sm">
                        <button className="p-2 text-slate-400 hover:text-[#555d66]">
                            <Paperclip size={15} />
                        </button>
                        <input
                            type="text"
                            placeholder="Digite sua resposta..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-xs px-1.5 font-medium text-[#2d3339]"
                        />
                        <button className="hidden sm:flex p-2 text-slate-400 hover:text-[#555d66]">
                            <Smile size={15} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center text-white shadow-md hover:bg-[#e64a00] active:scale-95 transition-all">
                            <Send size={14} />
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
}
