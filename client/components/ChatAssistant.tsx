"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, X, Send, Sparkles, User,
    Bot, Loader2, Minus, Maximize2, RotateCcw
} from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm your WBIZZ AI Assistant. How can I help you manage your business today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        const newMessages = [...messages, { role: "user", content: userMsg } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Please log in to chat with me. I need to know your account stats to help you better!"
                }]);
                setIsLoading(false);
                return;
            }

            const response = await fetch("http://localhost:8000/api/ai/assistant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (response.status === 401) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "Your session has expired. Please refresh the page and log in again."
                }]);
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            console.error("WBIZZ Assistant Connection Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm having a connection hiccup with the WBIZZ server. Please make sure the backend is running at http://localhost:8000."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([{ role: "assistant", content: "Hi! I'm your WBIZZ AI Assistant. How can I help you today?" }]);
    };

    const suggestions = [
        "How do I start a campaign?",
        "Show my account stats",
        "What's new in WBIZZ?",
        "Help with automation"
    ];

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? "72px" : "550px",
                            width: "380px"
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className={`bg-[#0b141a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden mb-4`}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-[#02C173]/20 to-[#128C7E]/20 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#02C173] rounded-lg shadow-[0_0_15px_rgba(2,193,115,0.3)]">
                                    <Sparkles className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none">WBIZZ Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 bg-[#02C173] rounded-full animate-pulse shadow-[0_0_5px_#02C173]" />
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0b141a]/50">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-[#202c33] text-[#02C173]" : "bg-[#02C173] text-black"
                                                    }`}>
                                                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-[#02C173] text-black rounded-tr-none shadow-lg shadow-[#02C173]/10"
                                                    : "bg-[#202c33]/80 text-gray-200 rounded-tl-none border border-white/5 shadow-inner"
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Quick Actions / Suggestions */}
                                    {messages.length === 1 && !isLoading && (
                                        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setInput(s); setTimeout(handleSend, 10); }}
                                                    className="p-3 text-left text-xs bg-[#202c33]/40 hover:bg-[#202c33] border border-white/5 rounded-xl text-gray-400 hover:text-[#02C173] transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-2.5 max-w-[85%]">
                                                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-[#02C173] text-black shadow-[0_0_10px_rgba(2,193,115,0.3)]">
                                                    <Bot className="w-4 h-4" />
                                                </div>
                                                <div className="bg-[#202c33]/80 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                                                    <div className="w-1.5 h-1.5 bg-[#02C173] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <div className="w-1.5 h-1.5 bg-[#02C173] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <div className="w-1.5 h-1.5 bg-[#02C173] rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-[#202c33]/30 border-t border-white/5 shrink-0">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask anything about WBIZZ..."
                                            className="flex-1 bg-[#2a3942] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#02C173]/50 transition-all placeholder:text-gray-500 border border-white/5"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="p-2.5 bg-[#02C173] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02C173]/90 active:scale-95 transition-all text-black rounded-xl shadow-[0_0_15px_rgba(2,193,115,0.2)]"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                    <p className="text-[10px] text-gray-500 text-center mt-3 flex items-center justify-center gap-1.5">
                                        <Sparkles className="w-2.5 h-2.5" /> Made with WBIZZ Intelligence
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launch Button (FAB) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative group ${isOpen ? "bg-red-500 rotate-90" : "bg-[#02C173]"
                    }`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <>
                        <div className="absolute inset-0 rounded-full bg-[#02C173] animate-ping opacity-25 group-hover:opacity-40" />
                        <MessageSquare className="w-6 h-6 text-black relative z-10" />
                    </>
                )}
            </motion.button>
        </div>
    );
}
