'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/config';

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

import Aurora from '@/components/ui/Aurora';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false); // Default to Register to match user image preference
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");

    const handleLogin = async (e?: React.FormEvent, signupEmail?: string, signupPassword?: string) => {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        const loginEmail = signupEmail || email;
        const loginPassword = signupPassword || password;

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginEmail)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('username', loginEmail);
            formData.append('password', loginPassword);

            const res = await fetch(`${API_URL}/token`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("token_type", data.token_type);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: name
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || 'Signup failed');
            }

            // After signup, auto-login
            await handleLogin(undefined, email, password);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020508] text-[#ededed] flex items-center justify-center p-4 overflow-hidden relative selection:bg-[#02C173] selection:text-black font-sans">

            {/* Aurora Background Effect */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-60">
                <Aurora
                    colorStops={["#02C173", "#128C7E", "#02C173"]}
                    blend={0.5}
                    amplitude={1.2}
                    speed={0.4}
                />
            </div>

            {/* Back Button */}
            <Link href="/" className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#02C173] group-hover:text-[#060707] group-hover:border-[#02C173] transition-all shadow-lg backdrop-blur-sm">
                    <ArrowLeft size={16} />
                </div>
                <span className="font-medium text-xs md:text-sm tracking-wide group-hover:translate-x-1 transition-transform">Back to Home</span>
            </Link>

            {/* Animated Background Orbs (Refined) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#02C173]/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#128C7E]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Main Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-[95%] md:w-full max-w-6xl h-auto min-h-[600px] md:h-[700px] bg-[#060707] rounded-3xl md:rounded-2xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:block"
            >

                {/* Diagonal Background Shape (Visible on Desktop) */}
                <motion.div
                    className="absolute inset-0 z-0 bg-gradient-to-br from-[#02352b] to-[#011a14] hidden md:block"
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
                    className="absolute left-8 top-1/2 -translate-y-1/2 w-[45%] z-10 pointer-events-none hidden md:block"
                    animate={{
                        x: isLogin ? 0 : -200,
                        opacity: isLogin ? 1 : 0,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="pointer-events-auto p-8">
                        <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WB</div>
                            <h1 className="text-4xl font-bold font-sans text-white">WBIZZ<span className="text-[#02C173]">.</span></h1>
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
                            Create an account
                        </motion.button>
                    </div>
                </motion.div>


                {/* Welcome Section - Register (Appear on Right - Green Side) */}
                <motion.div
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-[45%] z-10 text-right pointer-events-none hidden md:block flex flex-col items-end"
                    animate={{
                        x: isLogin ? 200 : 0,
                        opacity: isLogin ? 0 : 1,
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="pointer-events-auto w-full p-8 flex flex-col items-end">
                        <motion.div className="flex items-center gap-4 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-4xl font-bold font-sans text-white">WBIZZ<span className="text-[#02C173]">.</span></h1>
                            <div className="w-12 h-12 bg-[#02C173] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#02C173]/20">WB</div>
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
                            className="relative md:absolute md:right-0 md:top-0 w-full md:w-[52%] min-h-[500px] md:h-full flex flex-col justify-center p-8 md:px-16 bg-[#060707] z-20"
                            style={{ clipPath: typeof window !== 'undefined' && window.innerWidth > 768 ? 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' : 'none' } as any}
                        >
                            <h2 className="text-3xl font-bold mb-8 text-white">Sign In</h2>


                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full pl-10 pr-12 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}



                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-[#02C173] hover:bg-[#029a5b] text-[#060707] font-bold rounded-lg shadow-[0_0_20px_rgba(2,193,115,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#060707] border-t-transparent" />
                                    ) : (
                                        <>
                                            <LogIn size={18} />
                                            Sign In
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Mobile Toggle Link */}
                            <div className="mt-8 text-center md:hidden">
                                <p className="text-gray-400 text-sm">
                                    Don't have an account?{" "}
                                    <button onClick={() => setIsLogin(false)} className="text-[#02C173] font-bold hover:underline">
                                        Sign Up
                                    </button>
                                </p>
                            </div>
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
                            className="relative md:absolute md:left-0 md:top-0 w-full md:w-[52%] min-h-[550px] md:h-full flex flex-col justify-center p-8 md:px-16 bg-[#060707] z-20"
                            style={{ clipPath: typeof window !== 'undefined' && window.innerWidth > 768 ? 'polygon(0 0, 90% 0, 100% 100%, 0% 100%)' : 'none' } as any}
                        >
                            <h2 className="text-3xl font-bold mb-8 text-white">Create an account</h2>
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#02C173] transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-[#0b141a] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#02C173] transition-all"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {error && <p className="text-red-500 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-[#02C173] hover:bg-[#029a5b] text-[#060707] font-bold rounded-lg shadow-[0_0_20px_rgba(2,193,115,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#060707] border-t-transparent" />
                                    ) : (
                                        <>
                                            <UserPlus size={18} />
                                            Create an account
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            {/* Mobile Toggle Link */}
                            <div className="mt-8 text-center md:hidden">
                                <p className="text-gray-400 text-sm">
                                    Already have an account?{" "}
                                    <button onClick={() => setIsLogin(true)} className="text-[#02C173] font-bold hover:underline">
                                        Sign In
                                    </button>
                                </p>
                            </div>

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
