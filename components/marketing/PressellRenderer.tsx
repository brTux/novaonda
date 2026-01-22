"use client";

import React, { useEffect, useState } from "react";
import { Send, Volume2, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PressellRendererProps {
    pressell: any;
}

export default function PressellRenderer({ pressell }: PressellRendererProps) {
    const [trackingId, setTrackingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    const telegramLink = pressell.bot?.username
        ? `https://t.me/${pressell.bot.username}?start=tr_${trackingId || ""}`
        : "#";

    return (
        <div className="max-w-xl mx-auto px-4 py-8 md:py-20 flex flex-col items-center gap-8">
            {/* Header / Notice */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ambiente Seguro e Verificado</span>
            </div>

            {/* Headline */}
            <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-black leading-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    {pressell.title}
                </h1>
                <p className="text-slate-400 text-sm font-medium">Assista o vídeo abaixo para começar</p>
            </div>

            {/* Video / VSL Player */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-white/5 relative group">
                {pressell.vslUrl.includes("<iframe") ? (
                    <div className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: pressell.vslUrl }} />
                ) : (
                    <iframe
                        src={pressell.vslUrl.includes("youtube.com") ? pressell.vslUrl.replace("watch?v=", "embed/") : pressell.vslUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )}
            </div>

            {/* CTA Button */}
            <div className="w-full space-y-4">
                <a
                    href={telegramLink}
                    className={cn(
                        "w-full bg-[#ff5100] hover:bg-[#ff6a26] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-orange-500/20",
                        loading && "opacity-80 pointer-events-none"
                    )}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Send />}
                    {pressell.buttonText}
                </a>

                {/* Social Proof / Tiny notice */}
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Volume2 size={12} /> Ligue o som</span>
                    <span>•</span>
                    <span>12.405 pessoas online</span>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-[9px] text-slate-600 font-medium">
                © {new Date().getFullYear()} Nova Onda. Todos os direitos reservados.
            </footer>
        </div>
    );
}
