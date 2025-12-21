"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Send, Clock, BarChart2, Filter, Home, ArrowLeft, X, Check, Edit, Activity } from "lucide-react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { API_URL } from "@/lib/config";

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
    audience?: string;
    is_ab_test?: boolean;
    image_url?: string;
    template_id?: string;
};

const TEMPLATES = [
    {
        id: "diwali_sale",
        name: "Diwali Sale",
        body: "Happy Diwali! 🪔\n\nCelebrate the festival of lights with our exclusive 50% OFF sale on all items.\n\nShop now: https://example.com/diwali",
        image: "https://example.com/diwali-banner.jpg" // Placeholder
    },
    {
        name: "Welcome Message",
        body: "Hello! 👋\n\nWelcome to WBIZZ. We are excited to have you on board. Let us know if you have any questions!",
        image: ""
    },
    {
        id: "payment_reminder",
        name: "Payment Reminder",
        body: "Hi there,\n\nThis is a gentle reminder regarding your pending payment of $50. Please clear it by tomorrow to avoid interruptions.\n\nPay here: https://example.com/pay",
        image: ""
    }
];

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [stats, setStats] = useState({ total_sent: 0, avg_open_rate: 0, scheduled: 0 });

    // Mock Data for Sparklines
    const sparklineData = [
        { value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }, { value: 22 }
    ];
    const sparklineData2 = [
        { value: 65 }, { value: 68 }, { value: 72 }, { value: 70 }, { value: 75 }, { value: 78 }, { value: 80 }
    ];

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "Marketing",
        audience: "All Contacts",
        scheduled_date: "",
        is_ab_test: false,
        variant_a_body: "",
        variant_b_body: "",
        split_ratio: 50,
        image_url: "",
        template_id: ""
    });

    // Mock Audience Count (Would be fetched from backend in real app)
    const getAudienceCount = (audienceType: string) => {
        if (audienceType === 'All Contacts') return 342;
        if (audienceType === 'VIP') return 24;
        if (audienceType === 'Leads') return 156;
        if (audienceType === 'New') return 45;
        if (audienceType === 'Test Group') return 5;
        return 0;
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = e.target.value;
        const template = TEMPLATES.find(t => t.id === tId);

        if (template) {
            setFormData(prev => ({
                ...prev,
                template_id: tId,
                variant_a_body: template.body,
                image_url: template.image || prev.image_url // Keep existing if template has none
            }));
        } else {
            setFormData(prev => ({ ...prev, template_id: "" }));
        }
    };


    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login?redirect=/campaigns");
            return;
        }

        // Fetch Campaigns
        fetch(`${API_URL}/api/campaigns`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) {
                    console.error("Fetch Error:", res.status, res.statusText);
                    if (res.status === 401) {
                        // Token expired
                        localStorage.removeItem("access_token");
                        window.location.href = "/login";
                    }
                    throw new Error(`Network response was not ok: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setCampaigns(data);
                } else {
                    console.error("API did not return an array:", data);
                    setCampaigns([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch campaigns", err);
                setCampaigns([]);
            });

        // Fetch Stats
        fetch(`${API_URL}/api/campaigns/stats`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats", err));

    }, []);

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_URL}/api/campaigns/${editingId}`
                : `${API_URL}/api/campaigns`;

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedCampaign = await res.json();

                if (editingId) {
                    setCampaigns(campaigns.map(c => c.id === editingId ? updatedCampaign : c));
                } else {
                    setCampaigns([...campaigns, updatedCampaign]);
                }

                setShowModal(false);
                setEditingId(null);
                // Reset form
                setFormData({
                    name: "",
                    type: "Marketing",
                    audience: "All Contacts",
                    scheduled_date: "",
                    is_ab_test: false,
                    variant_a_body: "",
                    variant_b_body: "",
                    split_ratio: 50,
                    image_url: "",
                    template_id: ""
                });
            }
        } catch (e) {
            console.error("Failed to save", e);
        }
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingId(campaign.id);
        setFormData({
            name: campaign.name,
            type: campaign.type,
            audience: campaign.audience || "All Contacts",
            scheduled_date: campaign.scheduled_date,
            is_ab_test: campaign.is_ab_test || false,
            variant_a_body: "", // We might need to fetch details if not in list, but assuming basic update for now
            variant_b_body: "",
            split_ratio: 50,
            image_url: campaign.image_url || "",
            template_id: campaign.template_id || ""
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            name: "",
            type: "Marketing",
            audience: "All Contacts",
            scheduled_date: "",
            is_ab_test: false,
            variant_a_body: "",
            variant_b_body: "",
            split_ratio: 50,
            image_url: "",
            template_id: ""
        });
        setShowModal(true);
    };
    return (
        <div className="min-h-screen bg-white dark:bg-[#060707] p-8 md:p-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Campaigns</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create, schedule, and track your WhatsApp broadcasts.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-black font-semibold px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(2,193,115,0.3)]"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative overflow-hidden bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 p-5 rounded-xl shadow-sm dark:shadow-none transition-all group hover:border-[#02C173]/30">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Send size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sent</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_sent.toLocaleString()}</p>
                                <div className="h-10 w-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData}>
                                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 p-5 rounded-xl shadow-sm dark:shadow-none transition-all group hover:border-[#02C173]/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#02C173]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#02C173]/10 rounded-lg text-[#02C173]"><BarChart2 size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Open Rate</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_open_rate}%</p>
                                <div className="h-10 w-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparklineData2}>
                                            <Line type="monotone" dataKey="value" stroke="#02C173" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 p-5 rounded-xl shadow-sm dark:shadow-none transition-all group hover:border-[#02C173]/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={20} /></div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Scheduled</h3>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Campaigns List */}
                <div className="bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors">
                    <div className="p-4 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">All Campaigns</h3>

                        {/* Status Filter Tabs */}
                        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg">
                            {['All', 'Active', 'Scheduled', 'Completed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === status
                                        ? 'bg-white dark:bg-[#0b141a] text-[#02C173] shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#111b21] text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold transition-colors">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Audience</th>
                                    <th className="p-4 text-center">Delivered</th>
                                    <th className="p-4 text-center">Read</th>
                                    <th className="p-4 text-center">Replied</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
                                {campaigns
                                    .filter(c => filterStatus === 'All' || c.status === filterStatus)
                                    .map((camp) => (
                                        <motion.tr
                                            key={camp.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ backgroundColor: "rgba(100,100,100,0.05)" }}
                                            className="group cursor-pointer text-gray-600 dark:text-gray-300"
                                        >
                                            <td className="p-4">
                                                <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#02C173] transition-colors">{camp.name}</p>
                                                <span className="text-xs text-gray-500">{camp.type}</span>
                                            </td>
                                            <td className="p-4">
                                                {camp.status === 'Completed' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#02C173]/10 text-[#02C173] border border-[#02C173]/20">
                                                        <Check size={10} className="stroke-[3]" /> Completed
                                                    </span>
                                                )}
                                                {camp.status === 'Scheduled' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                        <Clock size={10} className="stroke-[3]" /> Scheduled
                                                    </span>
                                                )}
                                                {camp.status === 'Active' && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                        <Activity size={10} className="stroke-[3]" /> Active
                                                    </span>
                                                )}
                                                {!['Completed', 'Scheduled', 'Active'].includes(camp.status) && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                                        <Edit size={10} className="stroke-[3]" /> {camp.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                                    {camp.audience || 'All'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
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
                                            <td className="p-4 text-gray-500 dark:text-gray-500">
                                                {camp.scheduled_date}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(camp); }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                                    title="Edit Campaign"
                                                >
                                                    <Edit size={16} />
                                                </button>
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
                            className="bg-white dark:bg-[#0b141a] w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-[#111b21] transition-colors">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Campaign Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-[#1f2c34] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none transition-colors"
                                            placeholder="e.g. Summer Sale"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-[#1f2c34] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none"
                                        >
                                            <option value="Marketing">Marketing</option>
                                            <option value="Update">Update</option>
                                            <option value="Automation">Automation</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Audience</label>
                                        <select
                                            value={formData.audience}
                                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-[#1f2c34] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none"
                                        >
                                            <option value="All Contacts">All Contacts</option>
                                            <option value="VIP">VIP</option>
                                            <option value="Leads">Leads</option>
                                            <option value="New">New</option>
                                            <option value="Test Group">Test Group</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Schedule Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_date}
                                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-[#1f2c34] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none hover:[color-scheme:light] dark:hover:[color-scheme:dark]"
                                    />
                                </div>

                                {/* Template & Image Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-[#1f2c34]/30 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Load Template</label>
                                        <select
                                            value={formData.template_id}
                                            onChange={handleTemplateChange}
                                            className="w-full bg-white dark:bg-[#0b141a] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none"
                                        >
                                            <option value="">-- Select Template --</option>
                                            {TEMPLATES.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full bg-white dark:bg-[#0b141a] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* A/B Testing Toggle */}
                                <div className="bg-gray-50 dark:bg-[#1f2c34]/50 border border-gray-200 dark:border-white/5 rounded-xl p-4 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">A/B Testing</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Test two message variations to optimize performance.</p>
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
                                                        className="w-full bg-white dark:bg-[#0b141a] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:border-[#02C173] outline-none resize-none"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-blue-500 dark:text-blue-400">VARIANT B (Test)</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.variant_b_body}
                                                        onChange={(e) => setFormData({ ...formData, variant_b_body: e.target.value })}
                                                        placeholder="Hi {{1}}, don't miss out..."
                                                        className="w-full bg-white dark:bg-[#0b141a] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none resize-none"
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
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#02C173]"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Message Body</label>
                                            <textarea
                                                rows={4}
                                                value={formData.variant_a_body}
                                                onChange={(e) => setFormData({ ...formData, variant_a_body: e.target.value })}
                                                placeholder="Type your broadcast message here..."
                                                className="w-full bg-gray-50 dark:bg-[#0b141a] border border-gray-300 dark:border-white/10 rounded-lg p-3 text-gray-900 dark:text-white focus:border-[#02C173] outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50 dark:bg-[#111b21] transition-colors">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 dark:text-gray-400 font-medium hover:text-black dark:hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleCreate} className="px-6 py-2 bg-[#02C173] text-black font-bold rounded-lg hover:bg-[#02a965] shadow-lg shadow-[#02C173]/20 transition-all flex items-center gap-2">
                                    <span>{editingId ? 'Update Campaign' : (formData.is_ab_test ? 'Schedule A/B Test' : 'Send Campaign')}</span>
                                    {!editingId && <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">to ~{getAudienceCount(formData.audience)} users</span>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
