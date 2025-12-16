"use client";

import { motion } from "framer-motion";
import { MessageCircle, Users, Zap } from "lucide-react";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar
} from 'recharts';

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

const activity = [
    { id: 1, type: 'campaign_sent', user: 'Alice Smith', time: '2m ago', detail: 'Summer Sale Promo' },
    { id: 2, type: 'read', user: 'Alice Smith', time: '1m ago' },
    { id: 3, type: 'reply', user: 'Alice Smith', time: 'Just now', detail: 'Is this available in red?' },
    { id: 4, type: 'campaign_sent', user: 'Bob Jones', time: '5m ago', detail: 'Summer Sale Promo' },
    { id: 5, type: 'failed', user: 'Charlie Day', time: '10m ago', detail: 'Invalid Number' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                <div className="flex gap-2">
                    <button className="rounded-md bg-[#02C173] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#02A060] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02C173]">
                        New Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-[20px] bg-white dark:bg-[#0b141a] px-4 py-5 shadow border border-gray-200 dark:border-white/5 sm:p-6 transition-colors"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0 rounded-md bg-[#02C173]/10 p-3">
                                <stat.icon className="h-6 w-6 text-[#02C173]" aria-hidden="true" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900 dark:text-white">{stat.value}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid: Feed (Left) vs Charts (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Live Activity Feed (Span 1) */}
                <div className="overflow-hidden rounded-[24px] bg-white dark:bg-[#0b141a] shadow border border-gray-200 dark:border-white/5 h-full transition-colors">
                    <div className="p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white mb-6">Live Activity Feed</h3>
                        <div className="flow-root">
                            <ul role="list" className="-mb-8">
                                {activity.map((event, eventIdx) => (
                                    <li key={event.id}>
                                        <div className="relative pb-8">
                                            {eventIdx !== activity.length - 1 ? (
                                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-800" aria-hidden="true" />
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-[#0b141a] 
                              ${event.type === 'reply' ? 'bg-blue-500/20' :
                                                            event.type === 'failed' ? 'bg-red-500/20' :
                                                                event.type === 'read' ? 'bg-[#02C173]/20' : 'bg-gray-400/20'
                                                        }`}>
                                                        {/* Visual dot */}
                                                        <div className={`h-2.5 w-2.5 rounded-full 
                                  ${event.type === 'reply' ? 'bg-blue-500' :
                                                                event.type === 'failed' ? 'bg-red-500' :
                                                                    event.type === 'read' ? 'bg-[#02C173]' : 'bg-gray-400'
                                                            }`} />
                                                    </span>
                                                </div>
                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                    <div className="whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium text-gray-900 dark:text-white">{event.user}</span> {event.type.replace('_', ' ')}
                                                    </div>
                                                    <div className="whitespace-nowrap text-right text-sm text-gray-400 dark:text-gray-500">
                                                        <time>{event.time}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 2. Charts Column (Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top: Donut Chart Status */}
                    <div className="rounded-[24px] bg-white dark:bg-[#0b141a] shadow border border-gray-200 dark:border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between transition-colors">
                        <div className="w-full sm:w-1/2">
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
                        <div className="w-full sm:w-1/2 h-[200px] mt-6 sm:mt-0">
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
                    <div className="rounded-[24px] bg-white dark:bg-[#0b141a] shadow border border-gray-200 dark:border-white/5 p-6 transition-colors">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Activity Volume (7 Days)</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={volumeData}>
                                    <defs>
                                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#02C173" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#02C173" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Area type="monotone" dataKey="sent" stroke="#02C173" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                    <Area type="monotone" dataKey="replies" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReplies)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom 2: Audience Engagement Bar Chart */}
                    <div className="rounded-[24px] bg-white dark:bg-[#0b141a] shadow border border-gray-200 dark:border-white/5 p-6 transition-colors">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Audience Engagement by Hour</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Best times to send broadcasts.</p>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={engagementData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1f2c34', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="rate" fill="#02C173" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
