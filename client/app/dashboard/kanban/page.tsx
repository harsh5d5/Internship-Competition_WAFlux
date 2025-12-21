"use client";

import { useState, useEffect } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { Plus, MoreHorizontal, DollarSign, Calendar } from "lucide-react";
import { API_URL } from "@/lib/config";

// Types
type Lead = {
    id: string;
    name: string;
    company: string;
    value: string;
    status: string;
    last_contact: string;
    avatar?: string;
};

// Initial Column Config
const INITIAL_COLUMNS = [
    { id: "new", title: "New Leads", color: "bg-blue-500", limit: 10 },
    { id: "interested", title: "Interested", color: "bg-yellow-500", limit: 5 },
    { id: "negotiating", title: "Negotiating", color: "bg-purple-500", limit: 5 },
    { id: "closed", title: "Closed", color: "bg-[#02C173]", limit: 0 },
];

import { Edit2, Settings, Trash, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function KanbanPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState(INITIAL_COLUMNS);
    const [activeColMenuId, setActiveColMenuId] = useState<string | null>(null);
    const [editingColId, setEditingColId] = useState<string | null>(null);
    const [tempColTitle, setTempColTitle] = useState("");
    const [editingLimitColId, setEditingLimitColId] = useState<string | null>(null);
    const [tempLimitValue, setTempLimitValue] = useState("");

    // Dummy Data for visualization
    const DUMMY_LEADS: Lead[] = [
        { id: "1", name: "Alice Johnson", company: "TechCorp", value: "$5,000", status: "new", last_contact: "2 days ago" },
        { id: "2", name: "Bob Smith", company: "Designify", value: "$12,000", status: "interested", last_contact: "1 day ago" },
        { id: "3", name: "Charlie Davis", company: "EduLearn", value: "$3,500", status: "negotiating", last_contact: "4 hours ago" },
        { id: "4", name: "Diana Prince", company: "SecureIT", value: "$8,000", status: "closed", last_contact: "1 week ago" },
        { id: "5", name: "Ethan Hunt", company: "Mission Inc", value: "$20,000", status: "new", last_contact: "Just now" },
        { id: "6", name: "Fiona Gallagher", company: "Beverage Co", value: "$1,200", status: "interested", last_contact: "3 days ago" },
        { id: "7", name: "George Martin", company: "BookWrks", value: "$15,000", status: "negotiating", last_contact: "5 hours ago" },
    ];

    // Fetch logic
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        fetch(`${API_URL}/api/leads`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 401) {
                    // Optional: redirect or handle auth error
                    throw new Error("Unauthorized");
                }
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setLeads(data);
                } else {
                    console.log("No leads found, using dummy data");
                    setLeads(DUMMY_LEADS);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch leads, using dummy data:", err);
                setLeads(DUMMY_LEADS);
                setLoading(false);
            });
    }, []);

    // Filter leads by status with mapping
    const getLeadsByStatus = (columnId: string) => {
        if (!Array.isArray(leads)) return [];
        return leads.filter((l) => {
            const s = l.status.toLowerCase();
            switch (columnId) {
                case "new":
                    return s === "new" || s === "inactive" || s === "cold";
                case "interested":
                    return s === "active" || s === "interested" || s === "urgent";
                case "negotiating":
                    return s === "negotiating" || s === "connected" || s === "proposal";
                case "closed":
                    return s === "closed" || s === "customer" || s === "won";
                default:
                    return false;
            }
        });
    };

    // Data Transfer Handler for Drop
    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");
        if (!leadId) return;

        // Optimistic Update
        setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, status } : l))
        );

        // Backend Update
        const token = localStorage.getItem("access_token");
        fetch(`${API_URL}/api/leads/${leadId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status }),
        }).catch((err) => console.error("Update failed", err));
    };

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData("leadId", leadId);
    };

    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [newLead, setNewLead] = useState({ name: "", company: "", value: "", status: "new" });

    // Handle opening edit modal
    const openEditModal = (lead: Lead) => {
        setEditingLead(lead);
        setNewLead({
            name: lead.name,
            company: lead.company,
            value: lead.value,
            status: lead.status
        });
        setIsEditModalOpen(true);
    };

    // ... (fetch logic remains)

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch(`${API_URL}/api/leads`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: crypto.randomUUID(), // Optimistic ID
                    ...newLead,
                    last_contact: "Just now"
                })
            });

            if (!res.ok) throw new Error("Failed to create lead");

            const savedLead = await res.json();
            setLeads(prev => [...prev, savedLead]);
            setIsAddModalOpen(false);
            setNewLead({ name: "", company: "", value: "", status: "new" }); // Reset form
        } catch (error) {
            console.error("Error creating lead:", error);
            alert("Failed to create lead. Please try again.");
        }
    };

    const handleUpdateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLead) return;
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch(`${API_URL}/api/leads/${editingLead.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...editingLead,
                    ...newLead
                })
            });

            if (!res.ok) throw new Error("Failed to update lead");

            const updatedLead = await res.json();
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
            setIsEditModalOpen(false);
            setEditingLead(null);
            setNewLead({ name: "", company: "", value: "", status: "new" });
        } catch (error) {
            console.error("Error updating lead:", error);
            alert("Failed to update lead. Please try again.");
        }
    };

    const handleRenameColumn = (colId: string, currentTitle: string) => {
        setEditingColId(colId);
        setTempColTitle(currentTitle);
        setActiveColMenuId(null);
    };

    const saveColumnTitle = () => {
        if (editingColId && tempColTitle.trim()) {
            setColumns(prev => prev.map(c => c.id === editingColId ? { ...c, title: tempColTitle.trim() } : c));
        }
        setEditingColId(null);
        setTempColTitle("");
    };

    const handleSetLimit = (colId: string, currentLimit: number) => {
        setEditingLimitColId(colId);
        setTempLimitValue(currentLimit.toString());
        setActiveColMenuId(null);
    };

    const saveLimit = () => {
        if (editingLimitColId) {
            const limit = parseInt(tempLimitValue);
            setColumns(prev => prev.map(c => c.id === editingLimitColId ? { ...c, limit: isNaN(limit) ? 0 : limit } : c));
        }
        setEditingLimitColId(null);
        setTempLimitValue("");
    };

    const handleClearColumn = async (colId: string) => {
        if (!confirm(`Are you sure you want to clear all leads in this column? This will delete them forever.`)) return;

        const columnLeads = getLeadsByStatus(colId);
        const token = localStorage.getItem("access_token");

        // Optimistic UI
        setLeads(prev => prev.filter(l => !columnLeads.some(cl => cl.id === l.id)));

        // Batch delete on backend (ideally we should have a batch endpoint but for now we loop)
        try {
            await Promise.all(columnLeads.map(lead =>
                fetch(`${API_URL}/api/leads/${lead.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            ));
        } catch (error) {
            console.error("Batch delete failed", error);
        }
        setActiveColMenuId(null);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Smart CRM Board</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop leads to move them through your pipeline.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Lead
                </button>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 min-w-[1000px] pb-4">
                    {columns.map((col) => (
                        <div
                            key={col.id}
                            className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden min-w-[280px] transition-colors"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-4 border-t-4 ${col.color.replace('bg-', 'border-')} border-b border-gray-200 dark:border-white/5 flex flex-col gap-2 bg-white dark:bg-[#111b21] transition-colors relative`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                        {editingColId === col.id ? (
                                            <input
                                                autoFocus
                                                type="text"
                                                className="bg-gray-100 dark:bg-white/10 border-none outline-none rounded px-2 py-0.5 font-bold text-gray-900 dark:text-white text-lg w-full"
                                                value={tempColTitle}
                                                onChange={(e) => setTempColTitle(e.target.value)}
                                                onBlur={saveColumnTitle}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveColumnTitle();
                                                    if (e.key === 'Escape') setEditingColId(null);
                                                }}
                                            />
                                        ) : (
                                            <h3 className="font-bold text-gray-900 dark:text-white tracking-wide text-lg truncate max-w-[200px]">{col.title}</h3>
                                        )}
                                        {col.limit > 0 && getLeadsByStatus(col.id).length >= col.limit && (
                                            <AlertCircle className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveColMenuId(activeColMenuId === col.id ? null : col.id);
                                            }}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                        >
                                            <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-black dark:hover:text-white" />
                                        </button>

                                        <AnimatePresence>
                                            {activeColMenuId === col.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setActiveColMenuId(null)}></div>
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 py-2 py-2 overflow-hidden"
                                                    >
                                                        <button
                                                            onClick={() => handleRenameColumn(col.id, col.title)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-black/20 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> Rename Column
                                                        </button>
                                                        <button
                                                            onClick={() => handleSetLimit(col.id, col.limit)}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-black/20 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors"
                                                        >
                                                            <Settings className="w-4 h-4" /> Set Lead Limit
                                                        </button>
                                                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1"></div>
                                                        <button
                                                            onClick={() => handleClearColumn(col.id)}
                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm flex items-center gap-2 text-red-500 transition-colors"
                                                        >
                                                            <Trash className="w-4 h-4" /> Clear Column
                                                        </button>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <div
                                            onClick={() => handleSetLimit(col.id, col.limit)}
                                            className={`px-2 py-0.5 rounded-full text-[10px] cursor-pointer transition-colors flex items-center gap-1 ${getLeadsByStatus(col.id).length > col.limit && col.limit > 0 ? 'bg-red-500/20 text-red-500' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20'}`}
                                        >
                                            <span className="shrink-0">{getLeadsByStatus(col.id).length} /</span>
                                            {editingLimitColId === col.id ? (
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    className="bg-white dark:bg-[#1f2c34] border-none outline-none rounded px-1 w-8 text-center font-bold text-gray-900 dark:text-white"
                                                    value={tempLimitValue}
                                                    onChange={(e) => setTempLimitValue(e.target.value.replace(/[^0-9]/g, ''))}
                                                    onBlur={saveLimit}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveLimit();
                                                        if (e.key === 'Escape') setEditingLimitColId(null);
                                                    }}
                                                />
                                            ) : (
                                                <span className="font-bold">{col.limit > 0 ? col.limit : '∞'}</span>
                                            )}
                                            <span className="shrink-0">Leads</span>
                                        </div>
                                    </div>
                                    <span className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-1 rounded tabular-nums">
                                        ${getLeadsByStatus(col.id).reduce((sum, lead) => {
                                            const val = parseFloat(lead.value.replace(/[^0-9.-]+/g, ""));
                                            return sum + (isNaN(val) ? 0 : val);
                                        }, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Drop Area */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-[#0b141a]/50">
                                {getLeadsByStatus(col.id).map((lead) => (
                                    <motion.div
                                        key={lead.id}
                                        layoutId={lead.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead.id)}
                                        onClick={() => openEditModal(lead)}
                                        whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)" }}
                                        className="p-4 bg-white dark:bg-[#1f2c34] rounded-xl border border-gray-200 dark:border-white/5 cursor-grab active:cursor-grabbing hover:border-[#02C173]/50 transition-all group relative shadow-sm dark:shadow-black/20"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 overflow-hidden">
                                                    {lead.avatar ? (
                                                        <img src={lead.avatar} alt={lead.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        lead.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#02C173] transition-colors">{lead.name}</h4>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{lead.company}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                                                <DollarSign className="w-3.5 h-3.5 text-[#02C173]" />
                                                <span>{lead.value}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{lead.last_contact}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {getLeadsByStatus(col.id).length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-white/10 gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                            <Plus className="w-4 h-4 opacity-50" />
                                        </div>
                                        <span className="text-sm font-medium">Drop items here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Lead Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#111b21] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Lead</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                    placeholder="e.g. Acme Inc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Potential Value</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.value}
                                    onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                    placeholder="e.g. $5,000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.status}
                                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                >
                                    {columns.map(col => (
                                        <option key={col.id} value={col.id}>{col.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-[#02C173] hover:bg-[#02A060] text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-[#02C173]/20"
                                >
                                    Create Lead
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Lead Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#111b21] rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Lead</h2>
                            <button onClick={() => { setIsEditModalOpen(false); setEditingLead(null); }} className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Potential Value</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.value}
                                    onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                    value={newLead.status}
                                    onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                >
                                    {columns.map(col => (
                                        <option key={col.id} value={col.id}>{col.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Delete logic could go here if requested, but for now just cancel
                                        setIsEditModalOpen(false);
                                        setEditingLead(null);
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-2.5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#02C173] hover:bg-[#02A060] text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-[#02C173]/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
