"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Send, Clock, BarChart2, Filter, Home, ArrowLeft, X } from "lucide-react";
import Link from 'next/link';

type Campaign = {
    id: string;
    name: string;
    status: string;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    scheduled_date: string;
    type: string;
    is_ab_test?: boolean;
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "Marketing",
        scheduled_date: "",
        is_ab_test: false,
        variant_a_body: "",
        variant_b_body: "",
        split_ratio: 50
    });

    useEffect(() => {
        fetch("http://localhost:8000/api/campaigns")
            .then(res => res.json())
            .then(data => setCampaigns(data))
            .catch(err => console.error("Failed to fetch campaigns", err));
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const newCampaign = await res.json();
                setCampaigns([...campaigns, newCampaign]);
                setShowModal(false);
                // Reset form
                setFormData({
                    name: "",
                    type: "Marketing",
                    scheduled_date: "",
                    is_ab_test: false,
                    variant_a_body: "",
                    variant_b_body: "",
                    split_ratio: 50
                });
            }
        } catch (e) {
            console.error("Failed to create", e);
        }
    };
    return (
        <div className="min-h-screen bg-[#060707] p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Campaigns</h1>
                        <p className="text-sm text-gray-400">Create, schedule, and track your WhatsApp broadcasts.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-black font-semibold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(2,193,115,0.3)]"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0b141a] border border-white/5 p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Send size={20} /></div>
                            <h3 className="text-gray-400 text-sm font-medium">Total Sent</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">12,543</p>
                    </div>
                    <div className="bg-[#0b141a] border border-white/5 p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#02C173]/10 rounded-lg text-[#02C173]"><BarChart2 size={20} /></div>
                            <h3 className="text-gray-400 text-sm font-medium">Avg Open Rate</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">78.4%</p>
                    </div>
                    <div className="bg-[#0b141a] border border-white/5 p-5 rounded-xl">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={20} /></div>
                            <h3 className="text-gray-400 text-sm font-medium">Scheduled</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">3</p>
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-[#0b141a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-semibold text-white">All Campaigns</h3>
                        <button className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#111b21] text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4 text-center">Delivered</th>
                                    <th className="p-4 text-center">Read</th>
                                    <th className="p-4 text-center">Replied</th>
                                    <th className="p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {campaigns.map((camp) => (
                                    <motion.tr
                                        key={camp.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                                        className="group cursor-pointer text-gray-300"
                                    >
                                        <td className="p-4">
                                            <p className="font-medium text-white group-hover:text-[#02C173] transition-colors">{camp.name}</p>
                                            <span className="text-xs text-gray-500">{camp.type}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border
                             ${camp.status === 'Completed' ? 'bg-[#02C173]/10 text-[#02C173] border-[#02C173]/20' :
                                                    camp.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        camp.status === 'Active' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                {camp.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {camp.sent > 0 ? camp.sent.toLocaleString() : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            {camp.delivered > 0 ? ((camp.delivered / camp.sent) * 100).toFixed(1) + '%' : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            {camp.read > 0 ? ((camp.read / camp.sent) * 100).toFixed(1) + '%' : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            {camp.replied > 0 ? ((camp.replied / camp.sent) * 100).toFixed(1) + '%' : '-'}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {camp.scheduled_date}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0b141a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111b21]">
                                <h2 className="text-xl font-bold text-white">Create New Campaign</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Campaign Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#1f2c34] border border-white/10 rounded-lg p-3 text-white focus:border-[#02C173] outline-none transition-colors"
                                            placeholder="e.g. Summer Sale"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-[#1f2c34] border border-white/10 rounded-lg p-3 text-white focus:border-[#02C173] outline-none"
                                        >
                                            <option value="Marketing">Marketing</option>
                                            <option value="Update">Update</option>
                                            <option value="Automation">Automation</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Schedule Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        className="w-full bg-[#1f2c34] border border-white/10 rounded-lg p-3 text-white focus:border-[#02C173] outline-none hover:[color-scheme:dark]"
                                    />
                                </div>

                                {/* A/B Testing Toggle */}
                                <div className="bg-[#1f2c34]/50 border border-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-white">A/B Testing</h3>
                                            <p className="text-xs text-gray-400">Test two message variations to optimize performance.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_ab_test}
                                                onChange={(e) => setFormData({ ...formData, is_ab_test: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02C173]"></div>
                                        </label>
                                    </div>

                                    {formData.is_ab_test ? (
                                        <div className="space-y-4 animate-fade-in-up">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-[#02C173]">VARIANT A (Control)</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.variant_a_body}
                                                        onChange={(e) => setFormData({ ...formData, variant_a_body: e.target.value })}
                                                        placeholder="Hello {{1}}, check out our sale..."
                                                        className="w-full bg-[#0b141a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[#02C173] outline-none resize-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-blue-400">VARIANT B (Test)</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.variant_b_body}
                                                        onChange={(e) => setFormData({ ...formData, variant_b_body: e.target.value })}
                                                        placeholder="Hi {{1}}, don't miss out..."
                                                        className="w-full bg-[#0b141a] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-400 outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="text-[#02C173]">Variant A: {formData.split_ratio}%</span>
                                                    <span className="text-blue-400">Variant B: {100 - formData.split_ratio}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="90"
                                                    value={formData.split_ratio}
                                                    onChange={(e) => setFormData({ ...formData, split_ratio: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#02C173]"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Message Body</label>
                                            <textarea
                                                rows={4}
                                                value={formData.variant_a_body}
                                                onChange={(e) => setFormData({ ...formData, variant_a_body: e.target.value })}
                                                placeholder="Type your broadcast message here..."
                                                className="w-full bg-[#0b141a] border border-white/10 rounded-lg p-3 text-white focus:border-[#02C173] outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#111b21]">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-400 font-medium hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleCreate} className="px-6 py-2 bg-[#02C173] text-black font-bold rounded-lg hover:bg-[#02a965] shadow-lg shadow-[#02C173]/20 transition-all">
                                    {formData.is_ab_test ? 'Schedule A/B Test' : 'Schedule Campaign'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
