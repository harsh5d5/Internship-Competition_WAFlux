/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Activity } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const navItems = ['HOME', 'DASHBOARD', 'CONTACTS', 'CAMPAIGNS', 'TEMPLATES'];

  useEffect(() => {
    // Simple cookie check
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth=true'));
    setIsLoggedIn(!!authCookie);
  }, []);

  return (
    <div className="relative bg-white dark:bg-[#060707] w-full min-h-screen overflow-hidden selection:bg-[#02C173] selection:text-white dark:selection:text-black transition-colors duration-300">

      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Orb 1: Top Left - Primary Green */}
        <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[#02C173] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
        {/* Orb 2: Top Right - Teal */}
        <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-[#128C7E] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
        {/* Orb 3: Bottom Left - Accent Green */}
        <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] bg-[#02C173] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Glass Navbar */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
        <nav className="flex justify-between items-center px-6 py-4 rounded-full bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/50 transition-all">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-10 h-10 bg-[#02C173] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#02C173]/20">
              WF
            </div>
            <div className="text-2xl font-bold font-sans text-black dark:text-white transition-colors">
              WAFlux<span className="text-[#02C173]">.</span>
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
      <div className="flex flex-col-reverse md:flex-row items-center justify-center pt-32 md:pt-20 px-5 max-w-7xl mx-auto relative z-10 min-h-screen">

        {/* Text Content */}
        <div className="max-w-xl relative mt-10 md:mt-0 z-10 animate-fade-in-up">
          <h1 className="font-bold text-5xl md:text-7xl text-left uppercase text-black dark:text-white leading-tight tracking-tight transition-colors">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#02C173] to-[#128C7E]">WAFlux</span>
          </h1>
          <p className="font-normal text-left text-gray-600 dark:text-gray-400 mt-6 text-lg leading-relaxed transition-colors">
            Manage your WhatsApp Business communications with a premium, high-performance dashboard.
            Automate campaigns, track analytics, and engage with your audience effortlessly.
          </p>

          <div className="mt-10 flex gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <button className="bg-[#02C173] text-black font-bold py-4 px-10 rounded-full hover:bg-[#029a5b] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(2,193,115,0.4)] hover:shadow-[0_0_30px_rgba(2,193,115,0.6)]">
                {isLoggedIn ? "Go to Dashboard" : "Login / Signup"}
              </button>
            </Link>
            <button className="group border border-gray-300 dark:border-white/20 hover:border-[#02C173] bg-black/5 dark:bg-white/5 hover:bg-[#02C173]/10 text-black dark:text-white hover:text-[#02C173] font-bold py-4 px-10 rounded-full transition-all backdrop-blur-sm">
              View Live Demo <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-wrap gap-8 text-gray-600 dark:text-gray-400 text-sm transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#02C173]/10 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#02C173]" /></div>
              <span>Official WhatsApp API</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#02C173]/10 rounded-full"><ShieldCheck className="w-5 h-5 text-[#02C173]" /></div>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#02C173]/10 rounded-full"><Activity className="w-5 h-5 text-[#02C173]" /></div>
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>

        {/* Hero Image / Graphic */}
        <div className="relative z-10 md:ml-20 mt-10 md:mt-0 animate-float">
          <div className="relative w-[320px] h-[550px] md:w-[400px] md:h-[600px]">
            {/* Glass Phone/Card Container */}
            <div className="absolute inset-0 bg-[#0b141a]/90 rounded-[40px] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">

              {/* Chat Header */}
              <div className="bg-[#1f2c34] p-4 border-b border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#02C173] to-[#128C7E] flex items-center justify-center text-white font-bold text-lg">W</div>
                <div>
                  <h3 className="text-white font-bold text-sm">WAFlux Business</h3>
                  <p className="text-[#02C173] text-xs flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#02C173] animate-pulse"></span> Online
                  </p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-5 space-y-6 overflow-hidden relative flex flex-col justify-end pb-8">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {/* Message 1 (Incoming) */}
                <div className="flex items-start gap-3 relative z-10 animate-fade-in-up">
                  <div className="bg-[#1f2c34] p-3 rounded-r-xl rounded-bl-xl text-white/90 text-sm shadow-md max-w-[85%] border border-white/5 leading-relaxed">
                    <span className="text-[#02C173] text-xs font-bold block mb-1">Support Bot</span>
                    Hello! Welcome to WAFlux. Ready to automate your sales? 🚀
                    <span className="text-[10px] text-white/40 block text-right mt-1">10:00 AM</span>
                  </div>
                </div>

                {/* Message 2 (Outgoing) */}
                <div className="flex items-end justify-end gap-3 relative z-10 animate-fade-in-up animation-delay-2000">
                  <div className="bg-[#005c4b] p-3 rounded-l-xl rounded-br-xl text-white/90 text-sm shadow-md max-w-[85%] border border-white/5 leading-relaxed">
                    Yes! I need to broadcast a promo to 5k customers.
                    <span className="text-[10px] text-white/40 block text-right mt-1 flex items-center justify-end gap-1">
                      10:02 AM <span className="text-[#53bdeb]">✓✓</span>
                    </span>
                  </div>
                </div>

                {/* Message 3 (Incoming) */}
                <div className="flex items-start gap-3 relative z-10 animate-fade-in-up animation-delay-4000">
                  <div className="bg-[#1f2c34] p-3 rounded-r-xl rounded-bl-xl text-white/90 text-sm shadow-md max-w-[85%] border border-white/5 leading-relaxed">
                    <span className="text-[#02C173] text-xs font-bold block mb-1">Support Bot</span>
                    Easy! With WAFlux, you can send 5k messages in ~2 minutes with 99% delivery rate. ⚡
                    <br />
                    Starting setup...
                    <span className="text-[10px] text-white/40 block text-right mt-1">10:03 AM</span>
                  </div>
                </div>
              </div>

              {/* Chat Input Area (Visual only) */}
              <div className="p-3 bg-[#1f2c34] border-t border-white/5 flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full text-white/40 flex items-center justify-center">
                  <span className="text-xl">+</span>
                </div>
                <div className="h-10 flex-1 bg-[#2a3942] rounded-full border border-white/5 px-4 flex items-center text-white/30 text-sm">
                  Type a message...
                </div>
                <div className="w-10 h-10 rounded-full bg-[#02C173] flex items-center justify-center shadow-lg shadow-[#02C173]/20">
                  <svg className="w-5 h-5 text-[#0b141a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
