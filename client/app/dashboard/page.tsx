"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageCircle, Users, Zap,
    Mail, Eye, CornerDownLeft, AlertTriangle, CheckCircle2,
    ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar
} from 'recharts';
import { API_URL } from "@/lib/config";

// --- Mock Data for Charts ---
const statusData = [
    { name: 'Read', value: 60, color: '#02C173' },     // Green (WhatsApp brand)
    { name: 'Delivered', value: 25, color: '#3b82f6' }, // Blue
    { name: 'Sent', value: 10, color: '#eab308' },      // Yellow
    { name: 'Failed', value: 5, color: '#ef4444' },     // Red
];

const volumeData = [
    { name: 'Mon', sent: 400, replies: 240 },
    { name: 'Tue', sent: 300, replies: 139 },
    { name: 'Wed', sent: 550, replies: 380 },
    { name: 'Thu', sent: 450, replies: 280 },
    { name: 'Fri', sent: 700, replies: 450 },
    { name: 'Sat', sent: 200, replies: 120 },
    { name: 'Sun', sent: 150, replies: 80 },
];

const engagementData = [
    { name: '06h', rate: 10 },
    { name: '09h', rate: 45 },
    { name: '12h', rate: 30 },
    { name: '15h', rate: 75 },  // Peak
    { name: '18h', rate: 90 },  // Peak
    { name: '21h', rate: 55 },
    { name: '00h', rate: 20 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-gray-900 dark:text-white text-sm font-semibold mb-1">{label}</p>
                <p className="text-[#02C173] text-xs">Sent: {payload[0].value}</p>
                <p className="text-blue-400 text-xs">Replies: {payload[1].value}</p>
            </div>
        );
    }
    return null;
};

const stats = [
    { name: 'Total Contacts', value: '2,543', change: '+12.5%', changeType: 'positive', icon: Users },
    { name: 'Messages Sent', value: '12,300', change: '+8.2%', changeType: 'positive', icon: MessageCircle },
    { name: 'Active Conversions', value: '45', change: '-2.1%', changeType: 'negative', icon: Zap },
];

// Removed static activity data

export default function DashboardPage() {
    const router = useRouter();
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [activity, setActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/api/dashboard/activity`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setActivity(data);
                }
            } catch (error) {
                console.error("Failed to fetch activity", error);
            }
        };
        fetchActivity();
    }, []);

    const handleEventClick = (event: any) => {
        if (event.type === 'failed') {
            // Toggle tooltip for failure
            setSelectedEventId(selectedEventId === event.id ? null : event.id);
        } else {
            // Navigate to chats for reply, campaign_sent, read, etc.
            // Use contact_id if available, otherwise fallback to user name (though Chats page might not support name param fully yet)
            if (event.contact_id) {
                router.push(`/dashboard/chats?chatId=${event.contact_id}`);
            } else {
                router.push(`/dashboard/chats?user=${encodeURIComponent(event.user)}`);
            }
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reply': return <CornerDownLeft className="h-4 w-4 text-white" />;
            case 'failed': return <AlertTriangle className="h-4 w-4 text-white" />;
            case 'read': return <Eye className="h-4 w-4 text-white" />;
            case 'campaign_sent': return <CheckCircle2 className="h-4 w-4 text-white" />;
            default: return <Mail className="h-4 w-4 text-white" />;
        }
    };

    const getColorClass = (type: string) => {
        switch (type) {
            case 'reply': return 'bg-blue-500 ring-blue-500/20';
            case 'failed': return 'bg-red-500 ring-red-500/20';
            case 'read': return 'bg-[#02C173] ring-[#02C173]/20';
            default: return 'bg-gray-400 ring-gray-400/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/campaigns')}
                        className="rounded-md bg-[#02C173] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#02A060] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02C173]">
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[20px] bg-white/70 dark:bg-[#0b141a]/60 backdrop-blur-xl px-4 py-5 shadow-xl border border-gray-200/50 dark:border-white/10 sm:p-6 transition-all hover:shadow-2xl group"
                    >
                        {/* Gradient Glow Effect on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#02C173]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`flex-shrink-0 rounded-xl p-3 ${stat.changeType === 'positive'
                                    ? 'bg-[#02C173]/10 text-[#02C173]'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500'
                                    }`}>
                                    <stat.icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div className="ml-3 sm:ml-5">
                                    <p className="truncate text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 sm:mt-1">{stat.value}</p>
                                </div>
                            </div>

                            {/* Trend Indicator */}
                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${stat.changeType === 'positive'
                                ? 'text-[#02C173] bg-[#02C173]/5 border-[#02C173]/20'
                                : 'text-red-500 bg-red-500/5 border-red-500/20'
                                }`}>
                                {stat.changeType === 'positive' ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid: Feed (Left) vs Charts (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Live Activity Feed (Span 1) */}
                <div className="overflow-hidden rounded-[24px] bg-white/70 dark:bg-[#0b141a]/60 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-white/10 h-fit transition-colors flex flex-col">
                    <div className="p-6 pb-2">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Live Activity Feed</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar max-h-[520px]">
                        <div className="flow-root">
                            <ul role="list" className="-mb-8">
                                {activity.map((event, eventIdx) => (
                                    <li key={event.id}>
                                        <div className="relative pb-8">
                                            {eventIdx !== activity.length - 1 ? (
                                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                                            ) : null}
                                            <div
                                                className={`relative flex space-x-3 cursor-pointer group rounded-lg -ml-2 p-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all ${selectedEventId === event.id ? 'bg-gray-50 dark:bg-white/5' : ''}`}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                <div>
                                                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#0b141a] ${getColorClass(event.type)}`}>
                                                        {getIcon(event.type)}
                                                    </span>
                                                </div>
                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex justify-between w-full">
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                <span className="font-medium text-gray-900 dark:text-white hover:underline decoration-[#02C173]">{event.user}</span>
                                                                <span className="ml-1 opacity-80">{event.type.replace('_', ' ')}</span>
                                                            </div>
                                                            <div className="whitespace-nowrap text-right text-[11px] font-medium text-gray-400 dark:text-gray-500 tabular-nums">
                                                                {event.time === "Just now" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : event.time}
                                                            </div>
                                                        </div>

                                                        {/* Details Row (Reply Preview or Failure Reason) */}
                                                        {event.type === 'reply' && (
                                                            <p className="mt-1 text-xs text-blue-500 bg-blue-500/10 p-2.5 rounded-md border border-blue-500/20 break-words leading-relaxed">
                                                                <span className="inline-block mr-1 font-bold">↩</span>
                                                                {event.detail}
                                                            </p>
                                                        )}

                                                        {/* Failure Tooltip/Expansion */}
                                                        <AnimatePresence>
                                                            {selectedEventId === event.id && event.type === 'failed' && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-md border border-red-500/20">
                                                                        ⚠️ Failure Reason: <span className="font-semibold">{event.detail}</span>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-white/5 p-4 bg-gray-50 dark:bg-[#0b141a]/50">
                        <button
                            onClick={() => router.push('/dashboard/chats')}
                            className="w-full text-center text-sm font-medium text-[#02C173] hover:text-[#02A060] transition-colors flex items-center justify-center gap-1"
                        >
                            View all activity <span aria-hidden="true">&rarr;</span>
                        </button>
                    </div>
                </div>

                {/* 2. Charts Column (Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top: Donut Chart Status */}
                    <div className="rounded-[24px] bg-white/70 dark:bg-[#0b141a]/60 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-white/10 p-6 flex flex-col md:flex-row items-center justify-between transition-colors">
                        <div className="w-full md:w-1/2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Message Status Breakdown</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Real-time delivery statistics.</p>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-4">
                                {statusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.name}</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Donut Chart */}
                        <div className="w-full md:w-1/2 h-[180px] sm:h-[200px] mt-6 md:mt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        isAnimationActive={true}
                                        animationBegin={0}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom: Area Chart Volume */}
                    <div className="rounded-[24px] bg-white/70 dark:bg-[#0b141a]/60 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-white/10 p-6 transition-colors">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Activity Volume (7 Days)</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#02C173" stopOpacity={0.3}>
                                                <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                                            </stop>
                                            <stop offset="95%" stopColor="#02C173" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}>
                                                <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
                                            </stop>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="sent"
                                        stroke="#02C173"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSent)"
                                        animationDuration={2000}
                                        animationEasing="ease-in-out"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="replies"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorReplies)"
                                        animationDuration={2000}
                                        animationEasing="ease-in-out"
                                        animationBegin={500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom 2: Audience Engagement Bar Chart */}
                    <div className="rounded-[24px] bg-white/70 dark:bg-[#0b141a]/60 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-white/10 p-6 transition-colors">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Audience Engagement by Hour</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Best times to send broadcasts.</p>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={engagementData}>
                                    <defs>
                                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#02C173" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#02C173" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2c34', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="rate"
                                        fill="url(#colorBar)"
                                        radius={10}
                                        barSize={32}
                                        background={{ fill: 'currentColor', opacity: 0.05, radius: 10 }}
                                        animationDuration={1500}
                                        animationBegin={300}
                                        animationEasing="ease-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}
