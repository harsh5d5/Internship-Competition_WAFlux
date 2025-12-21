"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    MessageSquare, Cpu, Send, UserPlus,
    Zap, CheckCircle2, CircleDashed, ArrowRight,
    Settings, Play, Terminal, Database, Sparkles,
    BarChart3, Globe, ShieldCheck
} from "lucide-react";
import { API_URL } from "@/lib/config";

export default function AutomationWorkflow() {
    const [activeStep, setActiveStep] = useState(0);
    const [stats, setStats] = useState({ leads: 0, campaigns: 0, automations: 0 });

    useEffect(() => {
        // Auto-cycle the "Live" simulation
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 5);
        }, 3000);

        const fetchStats = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/api/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Stats fetch error:", err);
            }
        };
        fetchStats();
        return () => clearInterval(interval);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 20 }
        }
    };

    return (
        <section className="py-16 bg-[#05080a] relative overflow-hidden font-sans">
            {/* Professional Grid Background */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#02C173 1px, transparent 1px), linear-gradient(90deg, #02C173 1px, transparent 1px)', backgroundSize: '60px 60px' }}
            />

            {/* Dynamic Glow Orbs */}
            <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#02C173]/10 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] animate-pulse [animation-delay:1s]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-8 gap-8">
                    <div className="max-w-2xl w-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <div className="h-[2px] w-8 lg:w-12 bg-[#02C173]" />
                            <span className="text-[#02C173] text-[10px] lg:text-sm font-black tracking-[0.4em] uppercase">WBIZZ Engine v4.0</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 lg:mb-8 tracking-tighter leading-[0.9]"
                        >
                            Seamless <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02C173] to-emerald-400">Intelligence</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-lg lg:text-xl text-gray-400 leading-relaxed"
                        >
                            Experience our state-of-the-art automation architecture.
                            From raw WhatsApp signals to localized AI decision-making.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex flex-row lg:flex-row gap-3 lg:gap-4 w-full lg:w-auto"
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 lg:p-6 rounded-2xl lg:rounded-3xl flex-1 lg:min-w-[160px]">
                            <p className="text-2xl lg:text-3xl font-black text-white">{stats.leads}</p>
                            <p className="text-[9px] lg:text-[10px] text-gray-500 uppercase font-black mt-1">Total Leads Sync</p>
                        </div>
                        <div className="bg-[#02C173] p-4 lg:p-6 rounded-2xl lg:rounded-3xl flex-1 lg:min-w-[160px] shadow-[0_0_30px_rgba(2,193,115,0.3)]">
                            <p className="text-2xl lg:text-3xl font-black text-black">{stats.automations}</p>
                            <p className="text-[9px] lg:text-[10px] text-black/60 uppercase font-black mt-1">Live Workflows</p>
                        </div>
                    </motion.div>
                </div>

                {/* THE WORKFLOW VISUALIZATION */}
                <div className="relative pt-4">

                    {/* SVG Connections with Moving Particles */}
                    <svg className="absolute inset-0 w-full h-[400px] hidden lg:block pointer-events-none overflow-visible z-0">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#02C173" stopOpacity="0.2" />
                                <stop offset="50%" stopColor="#02C173" stopOpacity="1" />
                                <stop offset="100%" stopColor="#02C173" stopOpacity="0.2" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Line 1 -> 2 */}
                        <path d="M 320 200 L 400 200" stroke="white" strokeOpacity="0.05" strokeWidth="4" fill="none" />
                        {activeStep >= 1 && (
                            <motion.path
                                d="M 320 200 L 400 200"
                                stroke="#02C173"
                                strokeWidth="4"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                                filter="url(#glow)"
                            />
                        )}

                        {/* Line 2 -> 3 */}
                        <path d="M 580 200 L 660 200" stroke="white" strokeOpacity="0.05" strokeWidth="4" fill="none" />
                        {activeStep >= 2 && (
                            <motion.path
                                d="M 580 200 L 660 200"
                                stroke="#02C173"
                                strokeWidth="4"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                                filter="url(#glow)"
                            />
                        )}

                        {/* Branching from 3 -> Actions */}
                        <path d="M 880 200 C 930 200, 930 100, 990 100" stroke="white" strokeOpacity="0.05" strokeWidth="3.5" fill="none" />
                        <path d="M 880 200 L 990 200" stroke="white" strokeOpacity="0.05" strokeWidth="3.5" fill="none" />
                        <path d="M 880 200 C 930 200, 930 300, 990 300" stroke="white" strokeOpacity="0.05" strokeWidth="3.5" fill="none" />

                        {activeStep >= 3 && (
                            <>
                                <motion.path d="M 880 200 C 930 200, 930 100, 990 100" stroke="#02C173" strokeWidth="3.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} filter="url(#glow)" />
                                <motion.path d="M 880 200 L 990 200" stroke="#02C173" strokeWidth="3.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} filter="url(#glow)" />
                                <motion.path d="M 880 200 C 930 200, 930 300, 990 300" stroke="#02C173" strokeWidth="3.5" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} filter="url(#glow)" />

                                {/* Particle (the data packet) */}
                                <motion.circle r="6" fill="#02C173" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} filter="url(#glow)">
                                    <animateMotion path="M 880 200 L 990 200" dur="2s" repeatCount="indefinite" />
                                </motion.circle>
                            </>
                        )}
                    </svg>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0 h-auto lg:h-[400px] relative z-10"
                    >
                        {/* 1. INPUT SOURCE (SIGNALS) */}
                        <motion.div
                            variants={cardVariants}
                            className={`w-full max-w-[320px] lg:w-[280px] p-6 lg:p-6 bg-[#0c1116] border ${activeStep === 0 ? 'border-[#02C173] shadow-[0_0_30px_rgba(2,193,115,0.15)]' : 'border-white/5'} rounded-[2rem] transition-all duration-500`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-[#25d366]/10 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-[#25d366]" />
                                </div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest">WhatsApp Signal</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <p className="text-[11px] text-[#02C173] font-bold uppercase mb-1">Incoming Webhook</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-white font-mono">Payload: Message</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3 bg-[#02C173] rounded-full animate-bounce [animation-delay:0s]" />
                                            <div className="w-1 h-3 bg-[#02C173] rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1 h-3 bg-[#02C173] rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Meta Cloud API Connected
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. MIDDLE-WARE (BRAIN) */}
                        <motion.div
                            variants={cardVariants}
                            className={`w-32 h-32 lg:w-40 lg:h-40 rounded-[2.5rem] flex flex-col items-center justify-center transition-all bg-[#0c1116] border ${activeStep === 1 ? 'border-[#02C173] ring-4 ring-[#02C173]/10' : 'border-white/5'} shadow-2xl relative group my-4 lg:my-0`}
                        >
                            <div className="relative mb-2 lg:mb-3">
                                <motion.div
                                    animate={activeStep === 1 ? { rotate: 360 } : {}}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 -m-4 lg:-m-6 border-2 border-dashed border-[#02C173]/20 rounded-full"
                                />
                                <Cpu className={`w-8 h-8 lg:w-10 lg:h-10 transition-colors ${activeStep === 1 ? 'text-[#02C173]' : 'text-white/20'}`} />
                            </div>
                            <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeStep === 1 ? 'text-[#02C173]' : 'text-white/20'}`}>
                                Neural Bridge
                            </span>
                        </motion.div>

                        {/* 3. AI COGNITIVE NODE */}
                        <motion.div
                            variants={cardVariants}
                            className={`w-full max-w-[320px] lg:w-[280px] p-6 lg:p-6 bg-[#0c1116] border ${activeStep === 2 ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'border-white/5'} rounded-[2rem] transition-all duration-500`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                                <h4 className="text-white font-black text-sm uppercase tracking-widest">Cognitive Processing</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">LLM Engine</span>
                                    <span className="text-[10px] text-purple-400 font-black">GEMINI PRO</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div animate={activeStep === 2 ? { x: ["-100%", "100%"] } : { x: "-100%" }} transition={{ duration: 2, repeat: Infinity }} className="h-full w-1/2 bg-purple-500" />
                                </div>
                                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                                    <p className="text-[11px] text-purple-200">Processing Intent: "Pricing Inquiry"</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 4. RESULT COLUMN (DESTINATIONS) */}
                        <div className="flex flex-col justify-around gap-4 lg:gap-0 lg:h-[300px] mt-8 lg:mt-0 w-full max-w-[320px] lg:w-auto">
                            {[
                                { icon: Database, name: "Lead Synchronization", desc: "CRM Auto-Update", color: "#02C173", step: 3 },
                                { icon: UserPlus, name: "Audience Segmentation", desc: "Tag: High-Intent", color: "blue", step: 3 },
                                { icon: Send, name: "Smart Response", desc: "WhatsApp Dispatch", color: "orange", step: 4 }
                            ].map((task, i) => (
                                <motion.div
                                    key={i}
                                    variants={cardVariants}
                                    className={`w-full lg:w-[280px] p-4 bg-[#0c1116] border ${activeStep >= task.step ? 'border-white/20' : 'border-white/5 opacity-40'} rounded-2xl transition-all flex items-center gap-4`}
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${task.color}20` }}>
                                        <task.icon className="w-5 h-5" style={{ color: task.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-white truncate">{task.name}</p>
                                        <p className="text-[10px] text-gray-500">{task.desc}</p>
                                    </div>
                                    {activeStep >= task.step ? <CheckCircle2 className="w-4 h-4 text-[#02C173]" /> : <CircleDashed className="w-4 h-4 text-gray-600 animate-spin" />}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* PROJECT FEATURES BADGES */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {[
                        { icon: Cpu, label: "Gemini AI Core", text: "Automated contextual replies using Google Gemini Pro" },
                        { icon: Send, label: "Bulk Campaigns", text: "Mass broadcasting engine with template support" },
                        { icon: UserPlus, label: "Smart CRM", text: "Automatic lead capturing and contact management" },
                        { icon: Globe, label: "Cloud Native", text: "Direct integration with Official WhatsApp Cloud API" }
                    ].map((feature, i) => (
                        <div key={i} className="group cursor-default">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#02C173] group-hover:text-black transition-all">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h5 className="text-white font-black text-sm uppercase tracking-widest mb-2">{feature.label}</h5>
                            <p className="text-xs text-gray-500 leading-relaxed">{feature.text}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
