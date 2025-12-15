'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false); // Default to Register to match user image preference

    return (
        <div className="min-h-screen bg-[#020508] text-[#ededed] flex items-center justify-center p-4 overflow-hidden relative selection:bg-[#02C173] selection:text-black font-sans">

            {/* Back Button */}
            <Link href="/" className="absolute top-8 left-8 z-50 flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#02C173] group-hover:text-[#060707] group-hover:border-[#02C173] transition-all shadow-lg backdrop-blur-sm">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-medium text-sm tracking-wide group-hover:translate-x-1 transition-transform">Back to Home</span>
            </Link>

            {/* Animated Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#02C173]/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#128C7E]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-6xl h-[700px] bg-[#060707] rounded-2xl overflow-hidden shadow-2xl border border-white/5"
            >

                {/* Diagonal Background Shape (The 'Green Side' of the theme) */}
                <motion.div
                    className="absolute inset-0 z-0 bg-gradient-to-br from-[#02352b] to-[#011a14]"
                    animate={{
                        clipPath: isLogin
                            ? 'polygon(0 0, 100% 0, 62% 100%, 0% 100%)'   // Login: Shape covers Left/Center
                            : 'polygon(38% 0, 100% 0, 100% 100%, 0 100%)', // Register: Shape covers Right/Center
                    }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                >
                    {/* Texture/Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

                    {/* Internal Orbs */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#02C173]/20 rounded-full blur-3xl opacity-50"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#128C7E]/20 rounded-full blur-3xl opacity-50"
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </motion.div>


                {/* Welcome Section - Login (Appear on Left - Green Side) */}
                <motion.div
                    className="absolute left-12 top-1/2 -translate-y-1/2 w-[38%] z-10 pointer-events-none"
                    animate={{
                        x: isLogin ? 0 : -200,
                        opacity: isLogin ? 1 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WF</div>
                        <h1 className="text-4xl font-bold font-sans text-white">WAFlux<span className="text-[#02C173]">.</span></h1>
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-4 text-white">Welcome Back!</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
                        To keep connected with us please login with your personal info.
                    </p>
                    <motion.button
                        onClick={() => setIsLogin(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-[#022c22] transition-all pointer-events-auto shadow-lg"
                    >
                        Sign Up
                    </motion.button>
                </motion.div>


                {/* Welcome Section - Register (Appear on Right - Green Side) */}
                <motion.div
                    className="absolute right-12 top-1/2 -translate-y-1/2 w-[38%] z-10 text-right pointer-events-none flex flex-col items-end"
                    animate={{
                        x: isLogin ? 200 : 0,
                        opacity: isLogin ? 0 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WF</div>
                        <h1 className="text-4xl font-bold font-sans text-white">WAFlux<span className="text-[#02C173]">.</span></h1>
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-4 text-white">Join the Revolution!</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
                        Get access to advanced automation tools, real-time analytics, and scale your business with official WhatsApp API.
                    </p>
                    <motion.button
                        onClick={() => setIsLogin(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-[#022c22] transition-all pointer-events-auto shadow-lg"
                    >
                        Already have Account?
                    </motion.button>
                </motion.div>


                {/* Login Form (Slides from Right - Dark Side) */}
                <AnimatePresence mode="wait">
                    {isLogin && (
                        <motion.div
                            key="login"
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeInOut' }}
                            className="absolute right-0 top-0 w-[52%] h-full flex flex-col justify-center px-16 bg-[#060707] z-20"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}
                        >
                            <h2 className="text-3xl font-bold mb-8 text-white">Sign In</h2>
                            <div className="flex gap-4 mb-6">
                                <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-[#02C173] hover:text-[#02C173] cursor-pointer transition-colors bg-[#0b141a]"><Mail size={18} /></div>
                                <div className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:border-[#02C173] hover:text-[#02C173] cursor-pointer transition-colors bg-[#0b141a]"><Lock size={18} /></div>
                            </div>

                            <div className="relative mb-4 group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <div className="relative mb-6 group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <div className="text-right mb-6">
                                <a href="#" className="text-xs text-gray-400 hover:text-[#02C173] transition-colors">Forgot your password?</a>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-[#02C173] hover:bg-[#029a5b] text-[#060707] font-bold rounded-lg shadow-[0_0_20px_rgba(2,193,115,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                Sign In
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Register Form (Slides from Left - Dark Side) */}
                    {!isLogin && (
                        <motion.div
                            key="register"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{ duration: 0.7, ease: 'easeInOut' }}
                            className="absolute left-0 top-0 w-[52%] h-full flex flex-col justify-center px-16 bg-[#060707] z-20"
                            style={{ clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' }}
                        >
                            <h2 className="text-3xl font-bold mb-8 text-white">Register</h2>

                            <div className="relative mb-4 group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <div className="relative mb-4 group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <div className="relative mb-6 group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-[#02C173] hover:bg-[#029a5b] text-[#060707] font-bold rounded-lg shadow-[0_0_20px_rgba(2,193,115,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                Register
                            </motion.button>

                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-500">
                                    By registering, you agree to our <span className="text-[#02C173] cursor-pointer hover:underline">Terms & Conditions</span>
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
