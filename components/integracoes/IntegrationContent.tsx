"use client";

import React, { useState } from "react";
import { Facebook, CreditCard, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetaTrackingTab } from "./MetaTrackingTab";
import { PaymentsTab } from "./PaymentsTab";
import { WebhooksTab } from "./WebhooksTab";

interface IntegrationContentProps {
    bots: any[];
    credentials: any[];
}

export function IntegrationContent({ bots, credentials }: IntegrationContentProps) {
    const [activeTab, setActiveTab] = useState<"meta" | "payments" | "webhooks">("meta");

    const tabs = [
        { id: "meta", label: "Meta Tracking", icon: Facebook },
        { id: "payments", label: "Pagamentos", icon: CreditCard },
        { id: "webhooks", label: "Webhooks", icon: Share2 },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation */}
            <div className="px-6 md:px-10 border-b border-slate-100 bg-white">
                <div className="flex gap-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                                activeTab === tab.id
                                    ? "text-[#ff5100]"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff5100]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6 md:p-10 bg-slate-50/30">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                    {activeTab === "meta" && <MetaTrackingTab bots={bots} />}
                    {activeTab === "payments" && <PaymentsTab credentials={credentials} />}
                    {activeTab === "webhooks" && <WebhooksTab />}
                </div>
            </div>
        </div>
    );
}
