"use client";

import { motion } from "framer-motion";
import { Copy, Plus, MoreVertical, Edit, Search, Home, ArrowLeft } from "lucide-react";
import Link from 'next/link';

// Mock Template Data
const templates = [
    {
        id: 1,
        name: "welcome_offer_2024",
        category: "Marketing",
        language: "en_US",
        status: "Approved",
        body: "Hi {{1}}, welcome to WAFlux! 🚀 Here is an exclusive 20% off coupon for your first month: {{2}}. Expires in 24h.",
        lastUpdated: "2 days ago"
    },
    {
        id: 2,
        name: "order_confirmation",
        category: "Utility",
        language: "en_US",
        status: "Approved",
        body: "Hello {{1}}, your order #{{2}} has been confirmed. We will notify you when it ships. Thanks for shopping with us! 📦",
        lastUpdated: "1 week ago"
    },
    {
        id: 3,
        name: "appointment_reminder",
        category: "Utility",
        language: "en_US",
        status: "Pending",
        body: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Please reply YES to confirm.",
        lastUpdated: "5 hours ago"
    },
    {
        id: 4,
        name: "feedback_request",
        category: "Marketing",
        language: "es_MX",
        status: "Rejected",
        body: "Hola {{1}}, how was your experience with our support team? Rate us from 1-5.",
        lastUpdated: "Yesterday"
    }
];

export default function TemplatesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#060707] p-8 md:p-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Message Templates</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your WhatsApp approved message templates.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-black font-semibold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(2,193,115,0.3)]">
                        <Plus className="w-4 h-4" />
                        New Template
                    </button>
                </div>

                {/* Search / Filter Bar */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                        />
                    </div>
                    <select className="bg-gray-50 dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#02C173] transition-colors">
                        <option>All Categories</option>
                        <option>Marketing</option>
                        <option>Utility</option>
                        <option>Authentication</option>
                    </select>
                    <select className="bg-gray-50 dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#02C173] transition-colors">
                        <option>All Statuses</option>
                        <option>Approved</option>
                        <option>Pending</option>
                        <option>Rejected</option>
                    </select>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 rounded-xl p-5 hover:border-[#02C173]/30 transition-all group flex flex-col shadow-sm dark:shadow-none"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#02C173] transition-colors">{template.name}</h3>
                                    <div className="flex gap-2">
                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5">{template.category}</span>
                                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5">{template.language}</span>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border font-medium
                        ${template.status === 'Approved' ? 'bg-[#02C173]/10 text-[#02C173] border-[#02C173]/20' :
                                        template.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {template.status}
                                </span>
                            </div>

                            {/* Preview Box */}
                            <div className="bg-gray-50 dark:bg-[#1f2c34] p-3 rounded-lg text-sm text-gray-700 dark:text-white/90 mb-4 flex-1 border border-gray-200 dark:border-white/5 italic relative overflow-hidden transition-colors">
                                <span className="absolute top-0 right-0 p-1 bg-gray-50 dark:bg-[#1f2c34] rounded-bl-lg border-l border-b border-gray-200 dark:border-white/5 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-[#02C173]"></div>
                                </span>
                                "{template.body}"
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200 dark:border-white/5 mt-auto transition-colors">
                                <span>Updated {template.lastUpdated}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="Edit">
                                        <Edit size={14} />
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="Copy">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* New Template Placeholder Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500 dark:text-gray-500 hover:text-[#02C173] hover:border-[#02C173]/30 hover:bg-[#02C173]/5 cursor-pointer transition-all min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#02C173]/20 transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-sm">Create New Template</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
