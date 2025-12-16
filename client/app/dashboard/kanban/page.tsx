"use client";

import { useState, useEffect } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { Plus, MoreHorizontal, DollarSign, Calendar } from "lucide-react";

// Types
type Lead = {
    id: string;
    name: string;
    company: string;
    value: string;
    status: string;
    last_contact: string;
};

// Column Config
const columns = [
    { id: "new", title: "New Leads", color: "bg-blue-500" },
    { id: "interested", title: "Interested", color: "bg-yellow-500" },
    { id: "negotiating", title: "Negotiating", color: "bg-purple-500" },
    { id: "closed", title: "Closed", color: "bg-[#02C173]" },
];

export default function KanbanPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

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
        fetch("http://localhost:8000/api/leads", {
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

    // Filter leads by status
    const getLeadsByStatus = (status: string) => Array.isArray(leads) ? leads.filter((l) => l.status === status) : [];

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
        fetch(`http://localhost:8000/api/leads/${leadId}/status`, {
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

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Smart CRM Board</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop leads to move them through your pipeline.</p>
                </div>
                <button className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-black font-semibold px-4 py-2 rounded-lg transition-colors">
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
                            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#111b21] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                    <h3 className="font-semibold text-gray-900 dark:text-white tracking-wide">{col.title}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                        {getLeadsByStatus(col.id).length}
                                    </span>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-black dark:hover:text-white" />
                            </div>

                            {/* Drop Area */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-[#0b141a]/50">
                                {getLeadsByStatus(col.id).map((lead) => (
                                    <motion.div
                                        key={lead.id}
                                        layoutId={lead.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead.id)}
                                        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                                        className="p-4 bg-white dark:bg-[#1f2c34] rounded-lg border border-gray-200 dark:border-white/5 cursor-grab active:cursor-grabbing hover:border-[#02C173]/50 transition-all group relative shadow-sm dark:shadow-none"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-[#02C173] bg-[#02C173]/10 px-2 py-0.5 rounded">
                                                {lead.company}
                                            </span>
                                        </div>
                                        <h4 className="text-gray-900 dark:text-white font-medium mb-1 group-hover:text-[#02C173] transition-colors">{lead.name}</h4>

                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                <span>{lead.value}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{lead.last_contact}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {getLeadsByStatus(col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-lg flex items-center justify-center text-gray-400 dark:text-white/10 text-sm italic">
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
