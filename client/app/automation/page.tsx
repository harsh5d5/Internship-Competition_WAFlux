"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Play, Plus, MessageSquare, Clock, FileText, Image as ImageIcon, StickyNote, Zap, Split, ChevronRight, Layout, Sparkles, Bot, Palette, Trash2, RotateCcw, X } from "lucide-react";
import Link from 'next/link';

// --- Custom Nodes ---

const TriggerNode = ({ data }: any) => {
    return (
        <div className="bg-[#02C173]/10 backdrop-blur-2xl border-2 border-[#02C173]/50 shadow-[0_0_30px_rgba(2,193,115,0.2)] rounded-3xl min-w-[260px] overflow-hidden transition-all group scale-105">
            <div className="bg-[#02C173] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-[0.2em] leading-none mb-1">Entry Point</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Flow Trigger</span>
                    </div>
                </div>
                <button
                    onClick={() => data.onDelete(data.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <div className="p-4 bg-black/40">
                <select
                    className="w-full bg-white/5 backdrop-blur-md text-xs font-bold text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#02C173]/50 transition-all cursor-pointer"
                    value={data.label}
                    onChange={(e) => {
                        data.onChange(data.id, { label: e.target.value });
                    }}
                >
                    <option className="bg-[#111b21]" value='Keyword: START'>Keyword: START</option>
                    <option className="bg-[#111b21]" value='Keyword: OFFER'>Keyword: OFFER</option>
                    <option className="bg-[#111b21]" value='Keyword: AGENT'>Keyword: AGENT</option>
                    <option className="bg-[#111b21]" value="New Contact Added">New Contact Added</option>
                    <option className="bg-[#111b21]" value="Form Submitted">Form Submitted</option>
                </select>
                <div className="mt-3 flex items-center gap-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#02C173]" />
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-widest">Listening for events...</span>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-6 !bg-[#02C173] !border-2 !border-[#060707] !bottom-[-12px] !z-50 cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const ConditionNode = ({ data }: any) => {
    return (
        <div className="glass-card border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.15)] rounded-2xl min-w-[300px] overflow-hidden transition-all group">
            <Handle type="target" position={Position.Top} className="!w-6 !h-6 !bg-pink-500 !border-2 !border-[#060707] !top-[-12px] !z-50 cursor-crosshair" />
            <div className="bg-pink-500/10 backdrop-blur-xl p-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Split size={16} className="text-pink-400" />
                </div>
                <span className="text-xs font-semibold text-pink-100 uppercase tracking-[0.15em]">Logic Branch</span>
                <button
                    onClick={() => data.onDelete(data.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <div className="p-4 space-y-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[9px] text-white/40 font-semibold uppercase tracking-widest block mb-2">If User Message Contains</span>
                    <input
                        type="text"
                        className="w-full bg-transparent text-sm font-bold text-white focus:outline-none placeholder-white/10"
                        placeholder="e.g. price, cost, budget"
                        value={data.condition || ""}
                        onChange={(e) => {
                            data.onChange(data.id, { condition: e.target.value });
                        }}
                    />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#02C173]/10 border border-[#02C173]/20 relative">
                        <span className="text-[10px] font-semibold text-[#02C173] uppercase tracking-widest">Yes, Match Found</span>
                        <Handle type="source" position={Position.Right} id="yes" className="!w-3 !h-3 !bg-[#02C173] !border-2 !border-[#060707] !right-[-6px] !top-[50%]" />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20 relative">
                        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">No, Otherwise</span>
                        <Handle type="source" position={Position.Right} id="no" className="!w-3 !h-3 !bg-red-500 !border-2 !border-[#060707] !right-[-6px] !top-[50%]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const AINode = ({ data }: any) => {
    const [instruction, setInstruction] = useState(data.instruction || "");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const testAI = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: "Explain your purpose in one short sentence.",
                    system_instruction: instruction
                })
            });
            if (res.ok) {
                const result = await res.json();
                setResponse(result.response);
            } else {
                const errorData = await res.json();
                setResponse(`Error: ${errorData.detail || "AI failed to respond"}`);
            }
        } catch (err) {
            setResponse("Connection Error: Backend unreachable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-2xl border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)] rounded-3xl min-w-[320px] overflow-hidden transition-all group scale-100 hover:scale-[1.02]">
            <Handle type="target" position={Position.Top} className="!w-6 !h-6 !bg-indigo-500 !border-2 !border-[#060707] !top-[-12px] !z-50 cursor-crosshair" />
            <div className="bg-indigo-500/20 p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Bot size={20} className="text-white fill-white" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold text-indigo-200 uppercase tracking-[0.2em] leading-none mb-1">AI Cognitive</span>
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">Gemini Assistant</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => data.onDelete(data.id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={12} />
                    </button>
                    <div className="flex items-center gap-1">
                        <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-4 bg-black/40">
                <div>
                    <label className="text-[9px] uppercase text-white/40 font-semibold mb-2 block tracking-widest">System Instruction</label>
                    <textarea
                        className="w-full bg-white/5 backdrop-blur-md text-xs font-bold text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none h-[80px]"
                        placeholder="e.g. You are a helpful sales assistant. Answer questions about..."
                        value={instruction}
                        onChange={(e) => {
                            setInstruction(e.target.value);
                            data.onChange(data.id, { instruction: e.target.value });
                        }}
                    />
                </div>

                <div className="pt-2">
                    <button
                        onClick={testAI}
                        disabled={loading}
                        className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest border border-indigo-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Thinking...' : <><Play size={10} /> Test AI Brain</>}
                    </button>
                    {response && (
                        <div className="mt-3 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-top-1">
                            <p className="text-[10px] text-indigo-200/80 italic leading-relaxed">"{response}"</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-[9px] text-indigo-200/60 font-semibold uppercase tracking-widest">System Online</span>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-6 !bg-indigo-500 !border-2 !border-[#060707] !bottom-[-12px] !z-50 cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const NoteNode = ({ data }: any) => {
    const [color, setColor] = useState(data.color || 'yellow');
    const colors: any = {
        yellow: 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.1)]',
        blue: 'bg-blue-400/20 border-blue-400/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
        pink: 'bg-pink-400/20 border-pink-400/30 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.1)]',
        green: 'bg-[#02C173]/20 border-[#02C173]/30 text-[#02C173] shadow-[0_0_20px_rgba(2,193,115,0.1)]'
    };

    return (
        <div className={`${colors[color]} backdrop-blur-md border rounded-2xl min-w-[200px] max-w-[300px] p-5 transition-all group scale-100 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${color === 'yellow' ? 'bg-yellow-400/20' : color === 'blue' ? 'bg-blue-400/20' : color === 'pink' ? 'bg-pink-400/20' : 'bg-[#02C173]/20'} flex items-center justify-center`}>
                        <StickyNote size={14} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Sticky Note</span>
                </div>
                <button
                    onClick={() => data.onDelete(data.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
                {Object.keys(colors).map((c) => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-3 h-3 rounded-full hover:scale-125 transition-transform ${c === 'yellow' ? 'bg-yellow-400' : c === 'blue' ? 'bg-blue-400' : c === 'pink' ? 'bg-pink-400' : 'bg-[#02C173]'}`}
                    />
                ))}
            </div>
            <textarea
                className="w-full bg-transparent text-sm font-medium text-white/90 focus:outline-none resize-none h-[120px] leading-relaxed placeholder-white/20"
                placeholder="Type your notes here..."
                value={data.label || ""}
                onChange={(e) => {
                    data.onChange(data.id, { label: e.target.value });
                }}
            />
            <div className="mt-2 text-[8px] font-semibold uppercase tracking-tighter opacity-30">
                Last modified: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
};

const MessageNode = ({ data }: any) => {
    const [useTemplate, setUseTemplate] = useState(false);
    const [text, setText] = useState(data.label || "");
    const [loading, setLoading] = useState(false);

    const handleRewrite = async () => {
        const token = localStorage.getItem("access_token");
        if (!token || !text) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/ai/rewrite", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                const result = await res.json();
                setText(result.rewritten_text);
                data.label = result.rewritten_text;
            } else {
                const errorData = await res.json();
                alert(`AI Rewrite Error: ${errorData.detail || "Unknown error"}`);
            }
        } catch (err) {
            alert("AI connection failed. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] rounded-2xl min-w-[320px] overflow-hidden transition-all group">
            <Handle type="target" position={Position.Top} className="!w-6 !h-6 !bg-blue-500 !border-2 !border-[#060707] !top-[-12px] !z-50 cursor-crosshair" />
            <div className="bg-blue-500/10 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <MessageSquare size={16} className="text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-blue-100 uppercase tracking-[0.15em]">Send Message</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => data.onDelete(data.id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={12} />
                    </button>
                    <button
                        onClick={() => setUseTemplate(!useTemplate)}
                        className={`px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-widest transition-all ${useTemplate ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 border border-white/10'}`}
                    >
                        {useTemplate ? 'Template Mode' : 'Custom Text'}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4 font-normal">
                {useTemplate ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="text-[9px] uppercase text-white/40 font-semibold mb-2 block tracking-widest">Select Template</label>
                            <select className="w-full bg-white/5 backdrop-blur-md text-xs font-bold text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                <option className="bg-[#111b21]">welcome_offer_2024</option>
                                <option className="bg-[#111b21]">price_list_v2</option>
                                <option className="bg-[#111b21]">appointment_confirm</option>
                            </select>
                        </div>
                        <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/20 relative group/preview">
                            <div className="absolute top-[-10px] left-3 px-2 bg-[#060707] text-[8px] font-semibold text-blue-400 uppercase tracking-tighter border border-blue-500/20 rounded">Live Preview</div>
                            <p className="text-[11px] text-white/80 leading-relaxed italic">
                                "Hi <span className="text-blue-400 font-semibold text-xs">Customer Name</span>, thanks for reaching out! Here is our current price list for <span className="text-blue-400 font-semibold text-xs">Services</span>..."
                            </p>
                            <div className="absolute right-2 bottom-2 text-[8px] text-white/20 font-mono">10:30 AM ✓✓</div>
                        </div>
                    </div>
                ) : (
                    <div className="relative group/input">
                        <label className="text-[9px] uppercase text-white/40 font-semibold mb-2 block tracking-widest">Message Text</label>
                        <textarea
                            className="w-full bg-white/5 backdrop-blur-md text-sm text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none h-[100px] transition-all"
                            placeholder="Type your message..."
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                data.onChange(data.id, { label: e.target.value });
                            }}
                        />
                        <button
                            onClick={handleRewrite}
                            disabled={loading || !text}
                            className={`absolute right-3 bottom-3 p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg text-white shadow-lg opacity-0 group-hover/input:opacity-100 transition-all hover:scale-110 flex items-center gap-2 ${loading ? 'opacity-100 cursor-not-allowed' : ''}`}
                        >
                            <Sparkles size={12} className={loading ? 'animate-spin' : ''} />
                            <span className="text-[9px] font-semibold uppercase tracking-tighter">{loading ? 'Magic...' : 'AI Rewrite'}</span>
                        </button>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-6 !bg-blue-500 !border-2 !border-[#060707] !bottom-[-12px] !z-50 cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const DelayNode = ({ data }: any) => {
    return (
        <div className="glass-card border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] rounded-2xl min-w-[240px] overflow-hidden transition-all group scale-100 hover:scale-[1.02]">
            <Handle type="target" position={Position.Top} className="!w-6 !h-6 !bg-purple-500 !border-2 !border-[#060707] !top-[-12px] !z-50 cursor-crosshair" />
            <div className="bg-purple-500/10 backdrop-blur-xl p-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Clock size={16} className="text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-purple-100 uppercase tracking-[0.15em]">Time Delay</span>
                <button
                    onClick={() => data.onDelete(data.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 ml-auto"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <div className="p-4 flex gap-3">
                <input
                    type="number"
                    className="w-20 bg-white/5 backdrop-blur-md text-sm text-center font-semibold text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-mono"
                    value={data.value || 5}
                    onChange={(e) => {
                        data.onChange(data.id, { value: parseInt(e.target.value) });
                    }}
                />
                <select
                    className="flex-1 bg-white/5 backdrop-blur-md text-sm text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all cursor-pointer"
                    value={data.unit || 'Minutes'}
                    onChange={(e) => {
                        data.onChange(data.id, { unit: e.target.value });
                    }}
                >
                    <option className="bg-[#111b21]" value="Minutes">Minutes</option>
                    <option className="bg-[#111b21]" value="Hours">Hours</option>
                    <option className="bg-[#111b21]" value="Days">Days</option>
                </select>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-6 !bg-purple-500 !border-2 !border-[#060707] !bottom-[-12px] !z-50 cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const AttachmentNode = ({ data }: any) => {
    return (
        <div className="glass-card border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] rounded-2xl min-w-[280px] overflow-hidden transition-all group scale-100 hover:scale-[1.02]">
            <Handle type="target" position={Position.Top} className="!w-6 !h-6 !bg-orange-500 !border-2 !border-[#060707] !top-[-12px] !z-50 cursor-crosshair" />
            <div className="bg-orange-500/10 backdrop-blur-xl p-4 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <ImageIcon size={16} className="text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-[0.15em]">Attachment</span>
                <button
                    onClick={() => data.onDelete(data.id)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-500/50 text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100 ml-auto"
                >
                    <Trash2 size={12} />
                </button>
            </div>
            <div className="p-4">
                <label className="text-[9px] uppercase text-white/40 font-semibold mb-2 block tracking-widest">File Source</label>
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-orange-400">
                        <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            className="w-full bg-transparent text-sm text-white focus:outline-none truncate font-mono"
                            placeholder="https://example.com/file.pdf"
                            value={data.label || ""}
                            onChange={(e) => {
                                data.onChange(data.id, { label: e.target.value });
                            }}
                        />
                        <span className="text-[9px] text-white/30 uppercase font-semibold tracking-widest mt-1 block">Supported: PDF, IMG, VID</span>
                    </div>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-6 !h-6 !bg-orange-500 !border-2 !border-[#060707] !bottom-[-12px] !z-50 cursor-crosshair hover:scale-125 transition-transform" />
        </div>
    );
};

const initialNodes: any[] = [
    {
        id: '1',
        type: 'triggerNode',
        data: { label: 'Keyword: START' },
        position: { x: 250, y: -150 },
    },
    {
        id: '2',
        type: 'messageNode',
        data: { label: 'Hello! Welcome to our store.' },
        position: { x: 250, y: 150 },
    },
    {
        id: '3',
        type: 'conditionNode',
        data: { condition: 'price' },
        position: { x: 250, y: 450 },
    },
    {
        id: '4',
        type: 'attachmentNode',
        data: { label: 'https://wbizz.com/price-list.pdf' },
        position: { x: 650, y: 550 },
    },
    {
        id: '5',
        type: 'delayNode',
        data: { value: 5, unit: 'Minutes' },
        position: { x: 0, y: 750 },
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, label: '2.4k views', labelStyle: { fill: '#02C173', fontWeight: 900, fontSize: 10 } },
    { id: 'e2-3', source: '2', target: '3', animated: true, label: '98% conv', labelStyle: { fill: '#02C173', fontWeight: 900, fontSize: 10 } },
    { id: 'e3-4', source: '3', sourceHandle: 'yes', target: '4', animated: true, label: '450 clicks', labelStyle: { fill: '#02C173', fontWeight: 900, fontSize: 10 } },
];

export default function AutomationPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [saveStatus, setSaveStatus] = useState('All changes saved');
    const [flowStatus, setFlowStatus] = useState('Draft');
    const [isSimOpen, setIsSimOpen] = useState(false);
    const [simInput, setSimInput] = useState("");
    const [simMessages, setSimMessages] = useState<any[]>([]);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [simLoading, setSimLoading] = useState(false);
    const [flowId, setFlowId] = useState<string | null>(null);
    const [flowName, setFlowName] = useState('Welcome Flow');
    const [isEditingName, setIsEditingName] = useState(false);

    const deleteNode = useCallback((id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [setNodes, setEdges]);

    const createNewFlow = () => {
        if (confirm("Save current work and start a new automation?")) {
            setNodes(initialNodes.map(node => ({
                ...node,
                data: { ...node.data, id: node.id, onDelete: deleteNode, onChange: onNodeDataChange }
            })));
            setEdges(initialEdges);
            setFlowId(null);
            setFlowName(`New Automation ${Date.now().toString().slice(-4)}`);
            setFlowStatus('Draft');
            setSaveStatus('Draft Mode');
        }
    };

    const resetCanvas = () => {
        if (confirm("Are you sure you want to reset the entire automation? This cannot be undone.")) {
            setNodes([]);
            setEdges([]);
            setSaveStatus('Canvas Reset');
            setFlowId(null);
        }
    };

    const onNodeDataChange = useCallback((id: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    }, [setNodes]);

    useEffect(() => {
        const loadFlow = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:8000/api/automation", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const flows = await res.json();
                    if (flows && flows.length > 0) {
                        // Priority: Welcome Flow, then any existing flow
                        const flowToLoad = flows.find((f: any) => f.name === "Welcome Flow") || flows[0];

                        setFlowId(flowToLoad.id);
                        setFlowStatus(flowToLoad.status);
                        setFlowName(flowToLoad.name);
                        setNodes(flowToLoad.nodes.map((node: any) => ({
                            ...node,
                            data: { ...node.data, id: node.id, onDelete: deleteNode, onChange: onNodeDataChange }
                        })));
                        setEdges(flowToLoad.edges);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to load flow:", err);
            }

            // Fallback to initial nodes if no backend flow exists
            setNodes(initialNodes.map(node => ({
                ...node,
                data: { ...node.data, id: node.id, onDelete: deleteNode, onChange: onNodeDataChange }
            })));
            setEdges(initialEdges);
        };

        loadFlow();
    }, [deleteNode, onNodeDataChange]);

    const handleSave = useCallback(async (forcedStatus?: string) => {
        const token = localStorage.getItem("access_token");
        if (!token) return false;

        const currentStatus = forcedStatus || flowStatus;
        setSaveStatus('Saving...');
        try {
            const res = await fetch("http://localhost:8000/api/automation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: flowId,
                    name: flowName,
                    nodes,
                    edges,
                    status: currentStatus
                })
            });

            if (res.ok) {
                const savedFlow = await res.json();
                if (!flowId) setFlowId(savedFlow.id);
                setSaveStatus('All changes saved');
                return true;
            } else {
                setSaveStatus('Sync Error');
                return false;
            }
        } catch (error) {
            setSaveStatus('Offline');
            return false;
        }
    }, [nodes, edges, flowStatus, flowId, flowName]);

    const handlePublish = useCallback(async () => {
        setSaveStatus('Publishing...');
        const success = await handleSave('Published');
        if (success) {
            setFlowStatus('Published');
        }
    }, [handleSave]);

    const runSimulation = async () => {
        if (!simInput.trim() || simLoading) return;

        const currentInput = simInput;
        setSimInput("");
        setSimLoading(true);

        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`http://localhost:8000/api/leads/simulator_user/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: `sim_${Date.now()}`,
                    text: currentInput,
                    sender: "me",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: "sent"
                })
            });

            if (res.ok) {
                // Initial fetch after a short delay
                setTimeout(() => fetchSimMessages(), 1000);
            } else if (res.status === 401) {
                alert("Session expired. Please log in again.");
                window.location.href = "/login";
            } else {
                setSimLoading(false);
                const errorData = await res.json();
                console.error("Simulation Error:", errorData);
            }
        } catch (err) {
            setSimLoading(false);
            console.error("Simulation Exception:", err);
        }
    };

    const fetchSimMessages = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const leadRes = await fetch(`http://localhost:8000/api/leads/simulator_user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setSimMessages(leadData.messages || []);

                if (leadData.current_node_id) {
                    setActiveNodeId(leadData.current_node_id);
                    setTimeout(() => setActiveNodeId(null), 3000);
                }
            }
        } catch (err) {
            console.error("Failed to fetch simulator messages:", err);
        } finally {
            setSimLoading(false);
        }
    };

    // Auto-poll messages when simulator is open
    useEffect(() => {
        let interval: any;
        if (isSimOpen) {
            fetchSimMessages(); // Initial fetch
            interval = setInterval(fetchSimMessages, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSimOpen]);

    const resetSimulation = async () => {
        setSimLoading(true);
        const token = localStorage.getItem("access_token");
        try {
            await fetch("http://localhost:8000/api/leads/simulator_user", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimMessages([]);
            setActiveNodeId(null);
            setSimLoading(false);
        } catch (err) {
            setSimLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSave();
        }, 3000);
        return () => clearTimeout(timer);
    }, [nodes, edges, handleSave]);

    const nodeTypes = useMemo(() => ({
        triggerNode: TriggerNode,
        messageNode: MessageNode,
        conditionNode: ConditionNode,
        aiNode: AINode,
        delayNode: DelayNode,
        attachmentNode: AttachmentNode,
        noteNode: NoteNode,
    }), []);

    const onConnect = useCallback((params: Connection | Edge) => {
        const edgeStyle: any = { animated: true, style: { strokeWidth: 2 } };
        if (params.sourceHandle === 'yes') edgeStyle.style.stroke = '#02C173';
        else if (params.sourceHandle === 'no') edgeStyle.style.stroke = '#ef4444';
        else edgeStyle.style.stroke = '#3b82f6';
        setEdges((eds) => addEdge({ ...params, ...edgeStyle }, eds));
    }, [setEdges]);

    const addNode = (type: string) => {
        const newId = `node_${Date.now()}`;
        let newNode: any = {
            id: newId,
            position: { x: 400, y: 100 },
            data: { id: newId, onDelete: deleteNode, onChange: onNodeDataChange }
        };

        if (type === 'Trigger') {
            newNode.type = 'triggerNode';
            newNode.data = { ...newNode.data, label: 'Keyword: START' };
        } else if (type === 'Message') {
            newNode.type = 'messageNode';
            newNode.data = { ...newNode.data, label: 'New Message...' };
        } else if (type === 'Condition') {
            newNode.type = 'conditionNode';
            newNode.data = { ...newNode.data, condition: '' };
        } else if (type === 'AI') {
            newNode.type = 'aiNode';
            newNode.data = { ...newNode.data, instruction: '' };
        } else if (type === 'Delay') {
            newNode.type = 'delayNode';
            newNode.data = { ...newNode.data, value: 5, unit: 'Minutes' };
        } else if (type === 'Media') {
            newNode.type = 'attachmentNode';
            newNode.data = { ...newNode.data, label: '' };
        } else if (type === 'Note') {
            newNode.type = 'noteNode';
            newNode.data = { ...newNode.data, label: '' };
        }

        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="h-screen bg-white dark:bg-[#060707] flex flex-col transition-colors">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#111b21] z-10 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#02C173] animate-pulse"></span>
                            {isEditingName ? (
                                <input
                                    autoFocus
                                    className="bg-transparent border-b border-[#02C173] outline-none"
                                    value={flowName}
                                    onChange={(e) => setFlowName(e.target.value)}
                                    onBlur={() => setIsEditingName(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                />
                            ) : (
                                <span onClick={() => setIsEditingName(true)} className="cursor-pointer hover:text-white/80 transition-colors">
                                    {flowName}
                                </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${flowStatus === 'Published' ? 'bg-[#02C173]/10 text-[#02C173] border-[#02C173]/20' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20'}`}>
                                {flowStatus}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            {saveStatus === 'Saving...' ? 'Syncing with cloud...' : `Live Sync Active • V1.0`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest ${saveStatus === 'All changes saved' ? 'text-[#02C173]' : 'text-yellow-500'}`}>
                            {saveStatus}
                        </span>
                    </div>
                    <button onClick={createNewFlow} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all" title="Create New Flow">
                        <Plus size={20} />
                    </button>
                    <button onClick={resetCanvas} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Reset Engine">
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => setIsSimOpen(!isSimOpen)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg border transition-all ${isSimOpen ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500 hover:text-white'}`}
                    >
                        <Bot size={16} /> {isSimOpen ? 'Exit Simulator' : 'Test Simulator'}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={flowStatus === 'Published'}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all transform hover:-translate-y-0.5 ${flowStatus === 'Published' ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' : 'text-black bg-[#02C173] hover:bg-[#02a965] shadow-[0_0_15px_rgba(2,193,115,0.4)]'}`}
                    >
                        <Play size={16} /> {flowStatus === 'Published' ? 'Published' : 'Publish Flow'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-white/10 bg-[#060707] p-6 space-y-8 transition-colors z-20 overflow-y-auto">
                    <div>
                        <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-[#02C173] rounded-full shadow-[0_0_10px_#02C173]" />
                            Canvas Toolbox
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { id: 'Trigger', icon: Zap, color: 'text-[#02C173]', bg: 'bg-[#02C173]/20', title: 'Entry Trigger', desc: 'The starting logic point' },
                            { id: 'Message', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/20', title: 'Send Message', desc: 'Interactive chat bubbles' },
                            { id: 'Condition', icon: Split, color: 'text-pink-400', bg: 'bg-pink-500/20', title: 'Logic Branch', desc: 'Define if/else paths' },
                            { id: 'AI', icon: Bot, color: 'text-indigo-400', bg: 'bg-indigo-500/20', title: 'AI Assistant', desc: 'GPT-powered cognition' },
                            { id: 'Delay', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20', title: 'Time Delay', desc: 'Strategic wait periods' },
                            { id: 'Media', icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/20', title: 'Asset Injection', desc: 'Secure document delivery' },
                            { id: 'Note', icon: StickyNote, color: 'text-yellow-400', bg: 'bg-yellow-500/20', title: 'Sticky Note', desc: 'Logic annotations' }
                        ].map((item) => (
                            <div
                                key={item.id}
                                className="group p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                                onClick={() => addNode(item.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 flex items-center justify-center ${item.bg} ${item.color} rounded-xl group-hover:bg-opacity-30 transition-all`}>
                                        <item.icon size={22} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-white">{item.title}</span>
                                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{item.desc}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ReactFlow Canvas */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes.map(n => ({
                            ...n,
                            style: n.id === activeNodeId ? {
                                boxShadow: '0 0 50px rgba(2, 193, 115, 0.8)',
                                border: '3px solid #02C173',
                                borderRadius: '32px',
                                background: 'rgba(2, 193, 115, 0.1)'
                            } : {}
                        }))}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        connectionLineStyle={{ stroke: '#02C173', strokeWidth: 2 }}
                        fitView
                        className="bg-[#0b141a]"
                    >
                        <Background color="#1a1a1a" gap={20} size={1} />
                        <Controls className="!bg-[#111b21] !border-white/10 !fill-white" />

                        {/* Simulation UI */}
                        {isSimOpen && (
                            <div className="absolute right-6 top-6 bottom-32 w-96 bg-[#111b21] border border-white/10 rounded-3xl shadow-3xl z-[60] flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300">
                                <div className="p-4 bg-indigo-500/10 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                                            <Bot size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-white">Flow Simulator</span>
                                            <span className="text-[10px] text-[#02C173] font-black uppercase tracking-widest flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#02C173] animate-pulse" />
                                                Live Tracing
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={resetSimulation}
                                            className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Clear Chat History"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button onClick={() => setIsSimOpen(false)} className="p-2 text-white/40 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a] relative">
                                    {/* Subtle CSS Pattern for Background */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                    <div className="relative z-10 space-y-4">
                                        {simMessages.length === 0 && (
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-[11px] text-indigo-200/70 leading-relaxed text-center font-medium">
                                                Type <span className="text-white font-bold">"START"</span> to begin the automation trace.
                                            </div>
                                        )}
                                        {simMessages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-2xl relative ${msg.sender === 'me' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none border border-white/5'}`}>
                                                    {msg.text}
                                                    <div className="text-[9px] text-white/40 mt-1 text-right flex items-center justify-end gap-1">
                                                        {msg.time}
                                                        {msg.sender === 'me' && <span className="text-[#53bdeb] text-[10px]">✓✓</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {simLoading && (
                                            <div className="flex justify-start animate-in fade-in duration-300">
                                                <div className="bg-[#202c33] p-3 px-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center border border-white/5 shadow-xl">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-[#202c33] border-t border-white/5">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={simInput}
                                            onChange={(e) => setSimInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && runSimulation()}
                                            placeholder="Type (e.g. START)"
                                            className="w-full bg-[#2a3942] text-sm text-white p-4 pr-12 rounded-2xl focus:outline-none"
                                        />
                                        <button onClick={runSimulation} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl shadow-lg">
                                            <Play size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
