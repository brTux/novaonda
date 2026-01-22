"use client";

import React, { useEffect, useState } from "react";
import { Send, Volume2, ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PressellRendererProps {
    pressell: any;
}

export default function PressellRenderer({ pressell }: PressellRendererProps) {
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
    const [currentQuizStep, setCurrentQuizStep] = useState(0);

    useEffect(() => {
        // 1. Cloaking Logic (Safe URL Redirection)
        const isBot = /bot|googlebot|facebookexternalhit|bingbot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
        const isDesktop = window.innerWidth > 1024;

        if (pressell.safeUrl && (isBot || isDesktop)) {
            window.location.href = pressell.safeUrl;
            return;
        }

        async function track() {
            const urlParams = new URLSearchParams(window.location.search);
            const utms = {
                utm_source: urlParams.get("utm_source"),
                utm_medium: urlParams.get("utm_medium"),
                utm_campaign: urlParams.get("utm_campaign"),
                utm_content: urlParams.get("utm_content"),
                utm_term: urlParams.get("utm_term"),
            };

            try {
                const res = await fetch("/api/tracking/pressell", {
                    method: "POST",
                    body: JSON.stringify({ utms }),
                });
                const data = await res.json();
                setTrackingId(data.trackingId);
            } catch (err) {
                console.error("Tracking error:", err);
            } finally {
                setLoading(false);
            }
        }
        track();
    }, [pressell.safeUrl]);

    const telegramLink = pressell.bot?.username
        ? `https://t.me/${pressell.bot.username}?start=tr_${trackingId || ""}`
        : "#";

    const blocks = pressell.config || [];

    // If no blocks, show legacy layout
    if (blocks.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8 md:py-20 flex flex-col items-center gap-8 animate-in fade-in duration-700">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ambiente Seguro</span>
                </div>
                <div className="text-center space-y-3">
                    <h1 className="text-2xl md:text-3xl font-black leading-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                        {pressell.title}
                    </h1>
                </div>
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl overflow-hidden relative border border-white/5">
                    <VSLRenderer url={pressell.vslUrl} />
                </div>
                <div className="w-full space-y-4">
                    <a href={telegramLink} className="w-full bg-[#ff5100] hover:bg-[#ff6a26] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-500/20">
                        {loading ? <Loader2 className="animate-spin" /> : <Send />}
                        {pressell.buttonText}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6 animate-in fade-in duration-700 min-h-screen">
            {blocks.map((block: any) => (
                <div key={block.id} className="w-full">
                    <BlockDisplay
                        block={block}
                        telegramLink={telegramLink}
                        loading={loading}
                    />
                </div>
            ))}

            <footer className="mt-auto py-8 text-center text-[9px] text-slate-600 font-medium tracking-widest uppercase">
                © {new Date().getFullYear()} Nova Onda • Todos os direitos reservados
            </footer>
        </div>
    );
}

function VSLRenderer({ url }: { url: string }) {
    if (url.includes("<iframe")) {
        return <div className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: url }} />;
    }
    return (
        <iframe
            src={url.includes("youtube.com") ? url.replace("watch?v=", "embed/") : url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="VSL Player"
        />
    );
}

function BlockDisplay({ block, telegramLink, loading }: { block: any, telegramLink: string, loading: boolean }) {
    switch (block.type) {
        case "TEXT":
            return (
                <p className={cn(
                    "text-center font-black leading-tight",
                    block.content.size === "lg" ? "text-2xl md:text-3xl" : "text-sm text-slate-400"
                )} style={{ color: block.content.color }}>
                    {block.content.text}
                </p>
            );
        case "VSL":
            return (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
                    <VSLRenderer url={block.content.url} />
                </div>
            );
        case "QUIZ":
            return <QuizBlock content={block.content} telegramLink={telegramLink} />;
        case "BUTTON":
            return (
                <a
                    href={telegramLink}
                    className="w-full py-5 rounded-2xl font-black text-lg text-white flex items-center justify-center gap-3 transition-all shadow-xl hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: block.content.color || "#ff5100" }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    {block.content.text}
                </a>
            );
        default:
            return null;
    }
}

function QuizBlock({ content, telegramLink }: { content: any, telegramLink: string }) {
    const [step, setStep] = useState(0);

    // Quiz is simple for now: it always leads to the button/redirect after any choice
    const handleChoice = () => {
        // Usually, the last choice redirects
        window.location.href = telegramLink;
    };

    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-black text-center text-white">{content.question}</h3>
            <div className="space-y-3">
                {content.options.map((opt: string, i: number) => (
                    <button
                        key={i}
                        onClick={handleChoice}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-sm font-bold flex items-center justify-between group transition-all"
                    >
                        <span className="text-slate-300 group-hover:text-white">{opt}</span>
                        <ChevronRight size={16} className="text-[#ff5100]" />
                    </button>
                ))}
            </div>
        </div>
    );
}
