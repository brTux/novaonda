"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, Send, Bot, Phone, MoreVertical, Paperclip, Smile, Menu, User, Loader2, Globe, Tag, X, Plus, CreditCard, CheckCircle2, Clock, Trash2, Pause, Play, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMessages, sendMessage, getTransactions, updateConversationTags, deleteConversation, togglePauseConversation, triggerFlowForUser } from "@/app/actions/chat";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ChatInterfaceProps {
    initialConversations: any[];
    bots?: any[];
    flows?: any[];
    availableTags?: any[];
}

export function ChatInterface({ initialConversations, bots = [], flows = [], availableTags = [] }: ChatInterfaceProps) {
    const router = useRouter(); // Initialize router
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversations[0]?.id || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Advanced Lead States
    const [conversations, setConversations] = useState(initialConversations);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [selectedBotFilter, setSelectedBotFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    // ...
    // ... in the return block for Tags Section:

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    useEffect(() => {
        if (selectedConversationId) {
            setIsLoadingMessages(true);
            setIsLoadingDetails(true);

            // Fetch messages
            getMessages(selectedConversationId)
                .then(data => {
                    setMessages(data);
                    setIsLoadingMessages(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoadingMessages(false);
                });

            // Fetch Transactions
            getTransactions(selectedConversationId)
                .then(data => {
                    setTransactions(data);
                    setIsLoadingDetails(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsLoadingDetails(false);
                });
        }
    }, [selectedConversationId]);

    const handleAddTag = async () => {
        if (!newTag.trim() || !selectedConversationId || !selectedConversation) return;

        const updatedTags = [...(selectedConversation.tags || []), newTag.trim()];
        const result = await updateConversationTags(selectedConversationId, updatedTags);

        if (result.success) {
            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId ? { ...c, tags: updatedTags } : c
            ));
            setNewTag("");
        }
    };

    const handleRemoveTag = async (tagName: string) => {
        if (!selectedConversationId || !selectedConversation) return;

        const updatedTags = (selectedConversation.tags || []).filter((t: string) => t !== tagName);
        const result = await updateConversationTags(selectedConversationId, updatedTags);

        if (result.success) {
            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId ? { ...c, tags: updatedTags } : c
            ));
        }
    };

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

    const handlePauseToggle = async () => {
        if (!selectedConversationId || !selectedConversation) return;
        const newStatus = !selectedConversation.isPaused;
        const result = await togglePauseConversation(selectedConversationId, newStatus);
        if (result.success) {
            setConversations(prev => prev.map(c =>
                c.id === selectedConversationId ? { ...c, isPaused: newStatus } : c
            ));
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversationId || !confirm("Tem certeza que deseja apagar esta conversa?")) return;
        const result = await deleteConversation(selectedConversationId);
        if (result.success) {
            setConversations(prev => prev.filter(c => c.id !== selectedConversationId));
            setSelectedConversationId(null);
        }
    };

    const handleSendFlow = async (flowId: string) => {
        if (!selectedConversationId || !selectedConversation) return;
        const result = await triggerFlowForUser(selectedConversation.botId, selectedConversation.telegramUserId, flowId);
        if (result.success) {
            alert("Fluxo disparado com sucesso!");
        } else {
            alert("Erro ao disparar fluxo.");
        }
    };

    return (
        <div className="h-full flex overflow-hidden bg-white animate-in fade-in duration-500">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-16 lg:relative lg:inset-y-0 w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 z-30 transition-transform duration-300",
                !isSidebarOpen && "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0"
            )}>
                <div className="p-4 space-y-3">
                    <h1 className="text-sm font-bold text-[#2d3339]">Chat ao Vivo</h1>

                    {/* Bot Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
                        <button
                            onClick={() => setSelectedBotFilter("all")}
                            className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all whitespace-nowrap border",
                                selectedBotFilter === "all"
                                    ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            Todos
                        </button>
                        {bots.map((bot) => (
                            <button
                                key={bot.id}
                                onClick={() => setSelectedBotFilter(bot.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all whitespace-nowrap border",
                                    selectedBotFilter === bot.id
                                        ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {bot.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs font-medium focus:ring-1 ring-[#ff5100]/20 outline-none transition-all shadow-sm"
                            title="Buscar conversa"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                    {conversations
                        .filter(c => selectedBotFilter === "all" || c.botId === selectedBotFilter)
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .length === 0 && (
                            <div className="text-center p-4 text-slate-400 text-xs">
                                Nenhuma conversa encontrada.
                            </div>
                        )}
                    {conversations
                        .filter(c => selectedBotFilter === "all" || c.botId === selectedBotFilter)
                        .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((conv) => (
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
                                    {conv.avatar || conv.firstName?.charAt(0)?.toUpperCase() || "?"}
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
            <main className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden">
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
                                    {selectedConversation.avatar || selectedConversation.firstName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#2d3339] text-xs">{selectedConversation.name}</h2>
                                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                                        via {selectedConversation.botName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Flow Controls */}
                                <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1">
                                    <button
                                        onClick={handlePauseToggle}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all",
                                            selectedConversation.isPaused
                                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                : "bg-white text-slate-600 hover:bg-slate-100 shadow-sm"
                                        )}
                                        title={selectedConversation.isPaused ? "Retomar Bot" : "Pausar Bot"}
                                    >
                                        {selectedConversation.isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
                                        {selectedConversation.isPaused ? "Pausado" : "Pausar"}
                                    </button>

                                    <div className="relative group">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                                            <Zap size={12} className="text-orange-500" />
                                            Enviar Fluxo
                                            <ChevronDown size={10} />
                                        </button>

                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                                            <div className="px-2 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                                                Escolha o Fluxo
                                            </div>
                                            {flows
                                                .filter(f => f.botId === selectedConversation.botId)
                                                .map(flow => (
                                                    <button
                                                        key={flow.id}
                                                        onClick={() => handleSendFlow(flow.id)}
                                                        className="w-full text-left px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                                                    >
                                                        {flow.name}
                                                    </button>
                                                ))
                                            }
                                            {flows.filter(f => f.botId === selectedConversation.botId).length === 0 && (
                                                <div className="px-3 py-2 text-[10px] text-slate-400 italic">Sem fluxos publicados</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDeleteConversation}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Apagar Conversa"
                                >
                                    <Trash2 size={18} />
                                </button>
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
                                        const isFromBot = msg.sender === 'BOT' || msg.sender === 'AGENT';
                                        return (
                                            <div key={msg.id} className={cn(
                                                "flex gap-2 items-start max-w-[80%]",
                                                isFromBot ? "justify-end ml-auto" : ""
                                            )}>
                                                {!isFromBot && (
                                                    <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff5100] shrink-0 border border-orange-100">
                                                        <User size={13} />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "p-3 rounded-xl shadow-sm border",
                                                    isFromBot ? "bg-[#ff5100] border-[#ff5100] rounded-tr-none" : "bg-white border-slate-100 rounded-tl-none"
                                                )}>
                                                    <p className={cn("text-xs leading-relaxed font-medium", isFromBot ? "text-white" : "text-[#2d3339]")}>
                                                        {msg.content}
                                                    </p>
                                                    <span className={cn("text-[8px] font-bold mt-1.5 block opacity-50 text-right", isFromBot ? "text-orange-100" : "text-[#555d66]")}>
                                                        {format(new Date(msg.createdAt), "HH:mm")}
                                                    </span>
                                                </div>
                                                {isFromBot && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2d3339] shrink-0 font-bold text-[9px]">
                                                        {msg.sender === 'AGENT' ? 'A' : 'B'}
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

                    <div className="p-5 space-y-6 overflow-y-auto flex-1">
                        {/* Tags Section */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                <Tag size={12} /> Tags do Lead
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {(selectedConversation.tags || []).map((tag: string) => {
                                    const tagInfo = availableTags.find((t: any) => t.name === tag);
                                    const tagColor = tagInfo?.color || "#ff5100";
                                    return (
                                        <span key={tag}
                                            className="text-[9px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 group transition-all"
                                            style={{
                                                backgroundColor: `${tagColor}15`,
                                                borderColor: `${tagColor}30`,
                                                color: tagColor
                                            }}>
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:text-red-500 opacity-50 hover:opacity-100"
                                                title="Remover tag"
                                            >
                                                <X size={10} />
                                            </button>
                                        </span>
                                    );
                                })}
                                {selectedConversation.tags?.length === 0 && (
                                    <span className="text-[10px] text-slate-400 font-medium italic">Nenhuma tag...</span>
                                )}
                            </div>
                            <div className="relative mt-2">
                                <input
                                    type="text"
                                    placeholder="Nova tag..."
                                    value={newTag}
                                    onChange={(e) => {
                                        setNewTag(e.target.value);
                                        setShowTagSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 pl-3 pr-8 text-[10px] font-medium outline-none focus:ring-1 ring-orange-500/20"
                                    title="Nova tag"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#ff5100] hover:scale-110 transition-transform"
                                    title="Adicionar"
                                >
                                    <Plus size={14} />
                                </button>

                                {showTagSuggestions && newTag && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
                                        {availableTags
                                            .filter((t: any) =>
                                                t.name.toLowerCase().includes(newTag.toLowerCase()) &&
                                                (!t.botId || t.botId === selectedConversation.botId)
                                            )
                                            .map((t: any) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        setNewTag(t.name);
                                                        // Trigger add immediately? Or just fill input?
                                                        // Let's fill input for now.
                                                        setNewTag(t.name);
                                                        setShowTagSuggestions(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2"
                                                >
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                                                    {t.name}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

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
                            </div>
                        </div>

                        <div className="space-y-3">
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

                        {/* Transactions Section */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                                <CreditCard size={12} /> Histórico de Transações
                            </h4>
                            <div className="space-y-2">
                                {transactions.length === 0 && (
                                    <p className="text-[10px] text-slate-400 font-medium italic">Nenhum pagamento gerado.</p>
                                )}
                                {transactions.map((t: any) => (
                                    <div key={t.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-[#2d3339]">R$ {(t.amount / 100).toFixed(2)}</span>
                                            <div className={cn(
                                                "px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1",
                                                t.status === 'PAID' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                            )}>
                                                {t.status === 'PAID' ? <CheckCircle2 size={8} /> : <Clock size={8} />}
                                                {t.status === 'PAID' ? "Pago" : "Pendente"}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                                            <span>{t.provider}</span>
                                            <span>{format(new Date(t.createdAt), "dd/MM HH:mm")}</span>
                                        </div>
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
