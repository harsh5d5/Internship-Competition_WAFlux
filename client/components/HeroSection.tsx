/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Aurora from '@/components/ui/Aurora';
import { CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function HeroSection() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const navItems = ['HOME', 'DASHBOARD', 'CONTACTS', 'CAMPAIGNS', 'TEMPLATES'];

    useEffect(() => {
        // Check for access token
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <div className="relative bg-white dark:bg-[#060707] w-full min-h-screen overflow-hidden selection:bg-[#02C173] selection:text-white dark:selection:text-black transition-colors duration-300">

            {/* Aurora Background Effect */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-60">
                <Aurora
                    colorStops={["#02C173", "#128C7E", "#02C173"]}
                    blend={0.5}
                    amplitude={1.2}
                    speed={0.4}
                />
            </div>

            {/* Floating Glass Navbar */}
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
                <nav className="flex justify-between items-center px-6 py-4 rounded-full bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/50 transition-all">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
                        <div className="w-10 h-10 bg-[#02C173] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#02C173]/20">
                            WB
                        </div>
                        <div className="text-2xl font-bold font-sans text-black dark:text-white transition-colors">
                            WBIZZ<span className="text-[#02C173]">.</span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={
                                    item === 'DASHBOARD' ? '/dashboard' :
                                        item === 'CONTACTS' ? '/dashboard/contacts' :
                                            item === 'CAMPAIGNS' ? '/campaigns' :
                                                item === 'TEMPLATES' ? '/templates' : '#'
                                }
                                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full cursor-pointer transition-all duration-300"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <button className="hidden md:block bg-[#02C173]/10 dark:bg-[#02C173]/20 hover:bg-[#02C173]/20 dark:hover:bg-[#02C173]/30 text-[#029a5b] dark:text-[#02C173] px-5 py-2 rounded-full text-sm font-bold transition-all border border-[#02C173]/20 dark:border-[#02C173]/50">
                                Dashboard
                            </button>
                        </Link>
                        <ThemeToggle />
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center pt-48 pb-20 px-5 max-w-7xl mx-auto relative z-10 min-h-screen">

                {/* 1. Typography & Headline (Centered) */}
                <div className="max-w-4xl w-full text-center relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="font-black text-6xl md:text-8xl text-black dark:text-white leading-[1.1] tracking-tighter uppercase">
                            Scale Your Growth <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02C173] via-[#02C173] to-[#128C7E] drop-shadow-sm">
                                with WBIZZ.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed"
                    >
                        The ultimate high-performance dashboard for WhatsApp Business. Broadcast campaigns, automate interactions, and track every conversion in real-time.
                    </motion.p>

                    {/* 2. Redesigned CTAs (Centered) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
                    >
                        <Link href={isLoggedIn ? "/dashboard" : "/login"}>
                            <button className="relative group overflow-hidden bg-[#02C173] text-black font-black py-5 px-12 rounded-2xl hover:bg-[#02a965] transition-all transform hover:-translate-y-1 shadow-[0_20px_40px_rgba(2,193,115,0.3)] hover:shadow-[0_25px_50px_rgba(2,193,115,0.4)]">
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoggedIn ? "Access Dashboard" : "Start For Free"}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 transition-all group-hover:h-full group-hover:bg-black/5" />
                            </button>
                        </Link>

                        <button className="group relative overflow-hidden bg-white/5 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#02C173] backdrop-blur-xl text-black dark:text-white font-bold py-5 px-12 rounded-2xl transition-all transform hover:-translate-y-1">
                            <span className="relative z-10 flex items-center gap-2">
                                View Live Demo <span className="transition-transform group-hover:translate-x-1">→</span>
                            </span>
                        </button>
                    </motion.div>
                </div>

                {/* 3. Centralized Mockup (Featured Visual) */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-24 w-full max-w-5xl relative group"
                >
                    {/* Glowing Aura behind mockup */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#02C173]/20 to-[#128C7E]/20 rounded-[40px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative rounded-[32px] border border-white/10 bg-[#0b141a]/80 backdrop-blur-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] transform hover:scale-[1.01] transition-transform duration-700">
                        {/* Fake Dashboard Header */}
                        <div className="h-10 bg-white/5 dark:bg-black/20 border-b border-white/5 flex items-center px-6 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="mx-auto text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">WBIZZ • CLOUD INFRASTRUCTURE</div>
                        </div>

                        {/* Content Split: Chat vs Analytics */}
                        <div className="grid grid-cols-1 md:grid-cols-12 h-[500px]">
                            {/* Left: Interactive Chat Simulation */}
                            <div className="md:col-span-4 border-r border-white/5 flex flex-col">
                                <div className="p-4 border-b border-white/5 bg-[#1f2c34]/50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#02C173] to-[#128C7E] flex items-center justify-center text-white font-bold text-xs shadow-lg">W</div>
                                    <div>
                                        <h3 className="text-white font-bold text-xs">AI Support Bot</h3>
                                        <p className="text-[#02C173] text-[9px] flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#02C173] animate-pulse"></span> Active Engine
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 space-y-4 overflow-hidden flex flex-col justify-end">
                                    <div className="bg-[#1f2c34] p-3 rounded-2xl rounded-bl-none text-white/80 text-[11px] max-w-[90%] border border-white/5">
                                        Hello! How can WBIZZ help you today?
                                    </div>
                                    <div className="bg-[#005c4b] p-3 rounded-2xl rounded-br-none text-white/90 text-[11px] ml-auto max-w-[90%] border border-white/5">
                                        I want to launch a blast of 10,000 messages.
                                    </div>
                                    <div className="bg-[#1f2c34] p-3 rounded-2xl rounded-bl-none text-white/80 text-[11px] max-w-[90%] border border-white/5">
                                        Processing... Blast scheduled for 10:00 AM. Estimate: 4 mins.
                                    </div>
                                </div>
                                <div className="p-3 bg-[#1f2c34]/30">
                                    <div className="h-8 bg-black/20 rounded-full border border-white/5 px-4 flex items-center text-white/20 text-[10px]">
                                        Secure gateway active...
                                    </div>
                                </div>
                            </div>

                            {/* Right: Rich Data Visualization Simulation */}
                            <div className="md:col-span-8 p-8 bg-gradient-to-br from-black/20 to-transparent">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-white group font-bold flex items-center gap-2">
                                        Real-time Analytics
                                        <div className="px-2 py-0.5 bg-[#02C173]/10 text-[#02C173] rounded text-[9px] uppercase tracking-widest font-black">Live</div>
                                    </h4>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-2 rounded-full bg-[#02C173]/20" />
                                        <div className="w-8 h-2 rounded-full bg-white/5" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {[
                                        { label: "Messages Sent", val: "12,842", sub: "+12%" },
                                        { label: "Read Rate", val: "94.2%", sub: "Industry High" }
                                    ].map((stat, i) => (
                                        <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                                            <h5 className="text-2xl font-black text-white">{stat.val}</h5>
                                            <p className="text-[9px] text-[#02C173] font-bold mt-1">{stat.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Visual Chart Representation (Simple CSS) */}
                                <div className="h-40 w-full flex items-end gap-2 px-2">
                                    {[40, 70, 45, 90, 65, 80, 55, 100, 85, 75, 95, 60].map((h, i) => (
                                        <div
                                            key={i}
                                            style={{ height: `${h}%` }}
                                            className="flex-1 bg-gradient-to-t from-[#02C173]/10 to-[#02C173] rounded-t-lg transition-all duration-1000 group-hover:from-[#02C173]/30"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Trust signals Bar (Centered Horizontal) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6 text-gray-400 text-sm font-semibold uppercase tracking-widest"
                >
                    <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-[#02C173] group-hover:scale-110 transition-transform" />
                        <span>Official API</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                        <ShieldCheck className="w-5 h-5 text-[#02C173] group-hover:scale-110 transition-transform" />
                        <span>GDPR Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                        <Activity className="w-5 h-5 text-[#02C173] group-hover:scale-110 transition-transform" />
                        <span>99.9% Uptime</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
