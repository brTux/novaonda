"use client";

import React from "react";
import {
    Users,
    MessageSquare,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Calendar,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface DashboardClientProps {
    stats: any;
    chartData: any[];
    recentActivity: any[];
}

export default function DashboardClient({ stats, chartData, recentActivity }: DashboardClientProps) {
    return (
        <div className="h-full overflow-y-auto p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#2d3339]">Painel de Controle</h1>
                <p className="text-sm text-[#555d66] font-medium">Bem-vindo à nova era da automação.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {[
                    { label: "Faturamento", value: stats.totalRevenue, icon: TrendingUp, color: "text-emerald-500 bg-emerald-50" },
                    { label: "Ticket Médio", value: stats.averageTicket, icon: TrendingUp, color: "text-blue-500 bg-blue-50" },
                    { label: "Taxa Conversão", value: stats.conversionRate, icon: Zap, color: "text-[#ff5100] bg-[#fff5f0]" },
                    { label: "Eficiência Pix", value: stats.paymentEfficiency, icon: Zap, color: "text-emerald-500 bg-emerald-50" },
                    { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-blue-500 bg-blue-50" },
                    { label: "Vendas Pagas", value: stats.salesPaid, icon: Zap, color: "text-emerald-500 bg-emerald-50" },
                ].map((item) => (
                    <div key={item.label} className="glass-card p-6 bg-white border border-slate-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className={`${item.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                <item.icon size={20} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                <ArrowUpRight size={14} />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#555d66] uppercase tracking-wider mb-0.5">{item.label}</p>
                            <h3 className="text-xl font-bold text-[#2d3339]">{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 glass-card p-8 bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#2d3339]">Desempenho Geral</h3>
                            <p className="text-xs text-[#555d66]">Correlação entre novos leads e faturamento bruto</p>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-[#555d66] rounded-lg text-xs font-semibold hover:bg-slate-100 border border-slate-200 transition-all">
                            <Calendar size={14} /> Últimos 7 dias
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff5100" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ff5100" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#555d66", fontSize: 11 }}
                                    dy={10}
                                />
                                <YAxis yAxisId="left" hide />
                                <YAxis yAxisId="right" hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="leads"
                                    name="Leads"
                                    stroke="#ff5100"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLeads)"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Faturamento (R$)"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Info */}
                <div className="glass-card p-8 bg-white border border-slate-100 flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-[#2d3339]">Atividade Recente</h3>
                    <div className="space-y-6">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${activity.type === 'SALE'
                                    ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'
                                    : 'bg-slate-50 text-[#ff5100] group-hover:bg-[#fff5f0]'
                                    }`}>
                                    {activity.type === 'SALE' ? <TrendingUp size={18} /> : <Zap size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#2d3339] truncate">{activity.title}</p>
                                    <p className="text-[11px] text-[#555d66] font-medium mt-0.5">{activity.time} • {activity.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-auto w-full py-3 bg-slate-50 text-[#555d66] rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-200">
                        Ver Todo o Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}
