"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    Bot,
    Zap,
    Wrench,
    Bell,
    Menu,
    X,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Chat ao Vivo", icon: MessageSquare, href: "/chat" },
    { name: "Fluxos", icon: MessageSquare, href: "/fluxos" },
    { name: "Disparo", icon: Zap, href: "/disparo" },
    { name: "Bots", icon: Bot, href: "/bots" },
    { name: "Ferramentas", icon: Wrench, href: "/ferramentas" },
    { name: "Configurações", icon: Settings, href: "/settings" },
];

export function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-black/5 shadow-sm">
            <div className="h-full px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-[#ff5100] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            I
                        </div>
                        <span className="font-extrabold text-[#2d3339] tracking-tight text-xl hidden sm:block">Isy Flow</span>
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                                        isActive
                                            ? "text-[#ff5100] bg-[#fff5f0]"
                                            : "text-[#555d66] hover:text-[#2d3339] hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon size={16} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Notifications & Profile (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 border-r border-slate-100 pr-4 mr-2">
                        <button className="p-2 text-[#555d66] hover:text-[#ff5100] transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-[#2d3339] leading-none">Brendon Freitas</p>
                            <p className="text-[10px] text-[#555d66] mt-0.5">Administrador</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#2d3339] font-bold text-sm shadow-sm overflow-hidden bg-[url('https://avatar.vercel.sh/brendon')] bg-cover" />
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-[#2d3339] hover:bg-slate-50 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 animate-in slide-in-from-top-4 duration-300 overflow-y-auto">
                    <nav className="p-6 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "w-full px-4 py-4 rounded-xl text-md font-bold transition-all flex items-center gap-3",
                                        isActive
                                            ? "text-[#ff5100] bg-[#fff5f0]"
                                            : "text-[#2d3339] border border-slate-50"
                                    )}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
}
