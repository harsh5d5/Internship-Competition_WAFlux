'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, ShieldCheck, Zap, Bot, MessageSquare } from 'lucide-react';

export default function FeaturesBento() {
    return (
        <section className="relative w-full py-20 px-4 bg-[#060707] overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#02C173]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#128C7E]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full border border-[#02C173]/30 bg-[#02C173]/10 text-[#02C173] text-sm font-bold mb-4"
                    >
                        Capabilities
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02C173] to-[#128C7E]">Dominat</span> WhatsApp
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Replace your chaotic team chats with a structured, automated, and analytical command center.
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Smart Analytics (Large) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-[#0b141a] border border-white/5 p-8 transition-all hover:border-[#02C173]/30"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                            <BarChart3 className="text-[#02C173] w-24 h-24 rotate-12 transform translate-x-10 -translate-y-10" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-[#02C173]/10 flex items-center justify-center mb-6 text-[#02C173]">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Real-time Analytics</h3>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                Track message delivery, open rates, and customer engagement in real-time. Make data-driven decisions.
                            </p>

                            {/* Mock Graph Visual */}
                            <div className="h-32 w-full bg-[#060707] rounded-xl border border-white/5 p-4 flex items-end gap-2 relative overflow-hidden">
                                <div className="w-full h-[40%] bg-[#02C173]/20 rounded-t-sm" />
                                <div className="w-full h-[60%] bg-[#02C173]/30 rounded-t-sm" />
                                <div className="w-full h-[85%] bg-[#02C173]/50 rounded-t-sm" />
                                <div className="w-full h-[55%] bg-[#02C173]/30 rounded-t-sm" />
                                <div className="w-full h-[75%] bg-[#02C173] rounded-t-sm animate-pulse" />
                                <div className="w-full h-[95%] bg-[#02C173]/60 rounded-t-sm" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Team Inbox (Tall) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="md:row-span-2 relative group overflow-hidden rounded-3xl bg-[#0b141a] border border-white/5 p-8 transition-all hover:border-[#02C173]/30 flex flex-col"
                    >
                        <div className="w-12 h-12 rounded-xl bg-[#128C7E]/10 flex items-center justify-center mb-6 text-[#128C7E]">
                            <Users size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Team Inbox</h3>
                        <p className="text-gray-400 mb-8">
                            One number, multiple agents. Assign chats, label conversations, and collaborate seamlessly.
                        </p>

                        <div className="mt-auto space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#060707] border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-white">
                                        {i === 1 ? '👨‍💻' : i === 2 ? '👩‍💼' : '🤖'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-2 w-20 bg-gray-700 rounded-full mb-1.5" />
                                        <div className="h-1.5 w-12 bg-gray-800 rounded-full" />
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-green-500' : 'bg-gray-600'}`} />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 3: Automation (Square) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="min-h-[250px] relative group overflow-hidden rounded-3xl bg-[#0b141a] border border-white/5 p-8 transition-all hover:border-[#02C173]/30"
                    >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                            <Bot size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Chatbots</h3>
                        <p className="text-gray-400">
                            Automate support with intelligent bots that handle 80% of queries instantly.
                        </p>
                    </motion.div>

                    {/* Card 4: Lightning Fast (Square) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="min-h-[250px] relative group overflow-hidden rounded-3xl bg-[#0b141a] border border-white/5 p-8 transition-all hover:border-[#02C173]/30"
                    >
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-400">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Instant Broadcasts</h3>
                        <p className="text-gray-400">
                            Send personalized campaigns to 10k+ contacts in seconds with high deliverability.
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
