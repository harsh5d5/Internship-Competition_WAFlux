'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CheckIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-[#02C173] mt-1 shrink-0"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
                d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
                fill="currentColor"
                strokeWidth="0"
            />
        </svg>
    );
};

const Step = ({ title }: { title: string }) => {
    return (
        <li className="flex gap-2 items-start mb-2">
            <CheckIcon />
            <p className="text-white text-sm">{title}</p>
        </li>
    );
};

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false); // Default to Register to match user image preference
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Check for existing session
    if (typeof window !== "undefined") {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth=true'));
        if (authCookie) {
            router.push('/dashboard');
        }
    }

    const handleLogin = () => {
        setError("");
        if (email === "vickky@gmail.com" && password === "vickky123") {
            // Set cookie for 1 day
            document.cookie = "auth=true; path=/; max-age=86400";
            router.push("/dashboard");
        } else {
            setError("Invalid email or password");
        }
    };

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
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-[45%] z-10 pointer-events-none"
                    animate={{
                        x: isLogin ? 0 : -200,
                        opacity: isLogin ? 1 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="pointer-events-auto p-8">
                        <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WF</div>
                            <h1 className="text-4xl font-bold font-sans text-white">WAFlux<span className="text-[#02C173]">.</span></h1>
                        </motion.div>

                        <h2 className="text-3xl font-bold mb-4 text-white">Welcome Back!</h2>
                        <p className="text-gray-300 mb-6 leading-relaxed max-w-sm">
                            To keep connected with us please login with your personal info.
                        </p>

                        <div className="text-gray-200 mb-8 relative z-20">
                            <ul className="list-none mt-2">
                                <Step title="Access your Dashboard" />
                                <Step title="Manage Customer Journeys" />
                                <Step title="View Real-time Analytics" />
                            </ul>
                        </div>

                        <motion.button
                            onClick={() => setIsLogin(false)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-[#022c22] transition-all pointer-events-auto shadow-lg relative z-20"
                        >
                            Sign Up
                        </motion.button>
                    </div>
                </motion.div>


                {/* Welcome Section - Register (Appear on Right - Green Side) */}
                <motion.div
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-[45%] z-10 text-right pointer-events-none flex flex-col items-end"
                    animate={{
                        x: isLogin ? 200 : 0,
                        opacity: isLogin ? 0 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="pointer-events-auto w-full p-8 flex flex-col items-end">
                        <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-4xl font-bold font-sans text-white">WAFlux<span className="text-[#02C173]">.</span></h1>
                            <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WF</div>
                        </motion.div>

                        <h2 className="text-3xl font-bold mb-4 text-white">Join the Revolution!</h2>
                        <p className="text-gray-300 mb-6 leading-relaxed max-w-sm text-right">
                            Get access to advanced automation tools, real-time analytics, and official WhatsApp API.
                        </p>

                        <div className="text-gray-200 mb-8 relative z-20 w-full max-w-sm">
                            <ul className="list-none mt-2 flex flex-col items-end">
                                <Step title="Create a strong password" />
                                <Step title="Set up two-factor authentication" />
                                <Step title="Verify your identity" />
                            </ul>
                        </div>

                        <motion.button
                            onClick={() => setIsLogin(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border border-white/30 text-white rounded-full font-bold hover:bg-white hover:text-[#022c22] transition-all pointer-events-auto shadow-lg relative z-20"
                        >
                            Already have Account?
                        </motion.button>
                    </div>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            <div className="relative mb-6 group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                            <div className="text-right mb-6">
                                <a href="#" className="text-xs text-gray-400 hover:text-[#02C173] transition-colors">Forgot your password?</a>
                            </div>

                            <motion.button
                                onClick={handleLogin}
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
                                onClick={() => router.push('/dashboard')}
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
