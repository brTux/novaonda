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
    User,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Chat", icon: MessageSquare, href: "/chat" },
    { name: "Fluxos", icon: MessageSquare, href: "/fluxos" },
    { name: "Disparo", icon: Zap, href: "/disparo" },
    { name: "Bots", icon: Bot, href: "/bots" },
    { name: "Ferramentas", icon: Wrench, href: "/ferramentas" },
    // { name: "Configurações", icon: Settings, href: "/settings" }, // Moved to dropdown profile
];

interface NavigationProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function Navigation({ user }: NavigationProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 shadow-sm">
            <div className="h-full px-4 md:px-6 lg:px-8 flex items-center justify-between">

                {/* Left Side: Logo & Menu */}
                <div className="flex items-center gap-6 overflow-hidden">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            I
                        </div>
                        <span className="font-extrabold text-[#2d3339] tracking-tight text-xl hidden sm:block">Isy Flow</span>
                    </Link>

                    {/* Desktop Menu - Improved responsiveness */}
                    <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center gap-2 shrink-0",
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

                {/* Right Side: Profile & Actions */}
                <div className="flex items-center gap-2 md:gap-4 shrink-0">

                    {/* Mobile Menu Toggle */}
                    <button
                        className="xl:hidden p-2 text-[#2d3339] hover:bg-slate-50 rounded-lg transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Notifications (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 border-r border-slate-100 pr-4 mr-2">
                        <button className="p-2 text-[#555d66] hover:text-[#ff5100] transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                    </div>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-[#2d3339] leading-none">{user?.name || "Usuário"}</p>
                                <p className="text-[10px] text-[#555d66] mt-0.5 max-w-[100px] truncate">{user?.email || ""}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#ff5100] font-bold text-sm shadow-sm overflow-hidden">
                                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 border-b border-slate-50 mb-1 md:hidden">
                                        <p className="text-sm font-bold text-[#2d3339]">{user?.name || "Usuário"}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-[#555d66] hover:text-[#2d3339] hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Settings size={16} />
                                        Configurações
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sair
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="xl:hidden fixed inset-0 top-16 bg-white z-40 animate-in slide-in-from-top-4 duration-300 overflow-y-auto border-t border-slate-100">
                    <nav className="p-4 space-y-2">
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
                                            : "text-[#2d3339] border border-slate-50 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <Link
                            href="/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full px-4 py-4 rounded-xl text-md font-bold transition-all flex items-center gap-3 text-[#2d3339] border border-slate-50 hover:bg-slate-50"
                        >
                            <Settings size={20} />
                            Configurações
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
