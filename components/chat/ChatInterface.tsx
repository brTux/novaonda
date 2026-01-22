"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Bot, Phone, MoreVertical, Paperclip, Smile, Menu, User, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessages, sendMessage } from "@/app/actions/chat";
import { format } from "date-fns";

interface ChatInterfaceProps {
    initialConversations: any[];
}

export function ChatInterface({ initialConversations }: ChatInterfaceProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversations[0]?.id || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const selectedConversation = initialConversations.find(c => c.id === selectedConversationId);

    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);
            getMessages(selectedConversationId)
                .then(data => {
                    setMessages(data);
                    setIsLoadingMessages(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoadingMessages(false);
                });
        }
    }, [selectedConversationId]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversationId) return;

        setIsSending(true);
        const result = await sendMessage(selectedConversationId, newMessage);

        if (result.success && result.message) {
            setMessages(prev => [...prev, {
                id: result.message.id,
                content: result.message.content,
                sender: 'AGENT',
                createdAt: result.message.createdAt,
                type: 'TEXT'
            }]);
            setNewMessage("");
            scrollToBottom();
        } else {
            alert("Erro ao enviar mensagem");
        }
        setIsSending(false);
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-white animate-in fade-in duration-500 h-full">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-16 lg:relative lg:inset-y-0 w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 z-30 transition-transform duration-300",
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
                            title="Buscar conversa"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                    {initialConversations.length === 0 && (
                        <div className="text-center p-4 text-slate-400 text-xs">
                            Nenhuma conversa ainda.
                        </div>
                    )}
                    {initialConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => {
                                setSelectedConversationId(conv.id);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={cn(
                                "w-full p-2.5 rounded-lg flex items-center gap-2.5 transition-all text-left",
                                selectedConversationId === conv.id ? "bg-white shadow-sm border border-slate-100" : "hover:bg-white/60"
                            )}
                            title={`Conversa com ${conv.name}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#2d3339] font-bold text-[10px] shrink-0">
                                {conv.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="font-bold text-[#2d3339] text-[11px] truncate">{conv.name}</span>
                                    {conv.timestamp && (
                                        <span className="text-[9px] text-slate-400">
                                            {format(new Date(conv.timestamp), "HH:mm")}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-[#555d66] truncate font-medium">{conv.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative h-full">
                {selectedConversation ? (
                    <>
                        <header className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <button
                                    className="lg:hidden p-1.5 text-[#2d3339] hover:bg-slate-50 rounded-lg"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    title="Menu"
                                >
                                    <Menu size={18} />
                                </button>
                                <div className="w-8 h-8 rounded-full bg-[#ff5100] flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                                    {selectedConversation.avatar}
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#2d3339] text-xs">{selectedConversation.name}</h2>
                                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                        via {selectedConversation.botName}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin text-slate-300" />
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => {
                                        const isAgent = msg.sender === 'AGENT';
                                        return (
                                            <div key={msg.id} className={cn(
                                                "flex gap-2 items-start max-w-[80%]",
                                                isAgent ? "justify-end ml-auto" : ""
                                            )}>
                                                {!isAgent && (
                                                    <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100] shrink-0 border border-orange-100">
                                                        <User size={13} />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "p-3 rounded-xl shadow-sm border",
                                                    isAgent ? "bg-[#ff5100] border-[#ff5100] rounded-tr-none" : "bg-white border-slate-100 rounded-tl-none"
                                                )}>
                                                    <p className={cn("text-xs leading-relaxed font-medium", isAgent ? "text-white" : "text-[#2d3339]")}>
                                                        {msg.content}
                                                    </p>
                                                    <span className={cn("text-[8px] font-bold mt-1.5 block opacity-50 text-right", isAgent ? "text-orange-100" : "text-[#555d66]")}>
                                                        {format(new Date(msg.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                                {isAgent && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2d3339] shrink-0 font-bold text-[9px]">
                                                        A
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        <footer className="p-3 bg-white border-t border-slate-100">
                            <div className="max-w-4xl mx-auto flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 focus-within:ring-1 ring-[#ff5100]/10 focus-within:border-[#ff5100] transition-all shadow-sm">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Digite sua resposta..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-xs px-1.5 font-medium text-[#2d3339]"
                                    title="Nova mensagem"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isSending || !newMessage.trim()}
                                    className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center text-white shadow-md hover:bg-[#e64a00] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Enviar"
                                >
                                    {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                </button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <Bot size={48} className="mb-4 opacity-50" />
                        <p className="font-bold text-sm">Selecione uma conversa</p>
                    </div>
                )}
            </main>

            {selectedConversation && (
                <aside className="w-72 border-l border-slate-100 bg-white flex flex-col shrink-0 hidden xl:flex animate-in slide-in-from-right duration-300">
                    <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
                        <h3 className="text-sm font-bold text-[#2d3339]">Detalhes do Lead</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Informações de Origem</p>
                    </div>

                    <div className="p-5 space-y-6 overflow-y-auto">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                <Globe size={12} /> Localização
                            </h4>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 font-medium">Cidade/UF</span>
                                    <span className="font-bold text-[#2d3339]">{selectedConversation.city || "Não detectado"}, {selectedConversation.state || "?"}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 font-medium">IP de Acesso</span>
                                    <span className="font-bold text-[#2d3339] font-mono">{selectedConversation.ip || "---"}</span>
                                </div>
                                {selectedConversation.latitude && (
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-500 font-medium">Coordenadas</span>
                                        <span className="font-bold text-[#2d3339] font-mono">{selectedConversation.latitude.toFixed(4)}, {selectedConversation.longitude.toFixed(4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-[10px] font-bold text-[#ff5100] uppercase tracking-widest flex items-center gap-1.5">
                                <Search size={12} /> Marketing (UTMs)
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { label: "Source", value: selectedConversation.utmSource },
                                    { label: "Medium", value: selectedConversation.utmMedium },
                                    { label: "Campaign", value: selectedConversation.utmCampaign },
                                    { label: "Content", value: selectedConversation.utmContent },
                                ].map(utm => (
                                    <div key={utm.label} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 transition-all hover:bg-slate-100/50">
                                        <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{utm.label}</span>
                                        <span className="text-[11px] font-bold text-[#2d3339] break-all leading-tight">
                                            {utm.value || "direto / orgânico"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-50">
                            <div className="bg-orange-50 rounded-xl p-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff5100] animate-pulse" />
                                    <span className="text-[9px] font-bold text-[#ff5100] uppercase tracking-wide">Conversa Ativa</span>
                                </div>
                                <p className="text-[10px] text-orange-900/60 font-medium leading-relaxed">
                                    Este lead veio através de uma Pressell e está atualmente em atendimento.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
