"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Search, UserPlus, Filter, X, Phone, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface Contact {
    id: string;
    name: string;
    company: string;
    phone?: string;
    value: string;
    status: string;
    tags: string[];
    last_contact: string;
    avatar?: string;
}

export default function ContactsPage() {
    // Only used for initial state before fetch
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [imageErrorIds, setImageErrorIds] = useState<Set<string>>(new Set());

    // Modals & Popups
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    const [newContact, setNewContact] = useState({
        name: "",
        company: "",
        phone: "",
        status: "active",
        tags: "", // comma separated string for input
        value: "$0"
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Helper for Avatar Colors
    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400',
            'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400',
            'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
            'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
            'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
            'bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    // Fetch contacts
    useEffect(() => {
        const fetchContacts = async () => {
            const token = localStorage.getItem("access_token");
            try {
                const res = await fetch("http://127.0.0.1:8000/api/leads", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Pure API data, no duplicates
                    setContacts(data);
                } else if (res.status === 401) {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                }
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContacts();
    }, []);

    // Add/Edit Contact Handler
    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");
        const contactData = {
            ...newContact,
            id: isEditing && editingId ? editingId : crypto.randomUUID(),
            last_contact: "Just now",
            tags: newContact.tags.split(',').map(t => t.trim()).filter(t => t),
            value: newContact.value || "$0"
        };

        const url = isEditing && editingId
            ? `http://127.0.0.1:8000/api/leads/${editingId}`
            : "http://127.0.0.1:8000/api/leads";
        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(contactData)
            });

            if (res.ok) {
                const savedContact = await res.json();
                if (isEditing) {
                    setContacts(prev => prev.map(c => c.id === editingId ? savedContact : c));
                } else {
                    setContacts(prev => [...prev, savedContact]);
                }
                closeModal();
            } else {
                const errorData = await res.json();
                alert(`Failed to save contact: ${JSON.stringify(errorData.detail || errorData)}`);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Failed to save contact.");
        }
    };

    const handleDeleteContact = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const token = localStorage.getItem("access_token");
            const res = await fetch(`http://127.0.0.1:8000/api/leads/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setContacts(prev => prev.filter(c => c.id !== id));
            } else {
                alert("Failed to delete contact.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (contact: Contact) => {
        setNewContact({
            name: contact.name,
            company: contact.company,
            phone: contact.phone || "",
            status: contact.status,
            tags: contact.tags.join(", "),
            value: contact.value
        });
        setEditingId(contact.id);
        setIsEditing(true);
        setIsAddModalOpen(true);
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setNewContact({ name: "", company: "", phone: "", status: "active", tags: "", value: "$0" });
        setIsEditing(false);
        setEditingId(null);
    };

    // Filter Logic
    const filteredContacts = contacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            contact.name.toLowerCase().includes(query) ||
            (contact.phone && contact.phone.toLowerCase().includes(query)) ||
            (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(query))) ||
            contact.company.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 relative h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Contacts</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your audience and leads</p>
                </div>
                <div className="flex gap-2 relative">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset transition-colors ${statusFilter !== 'all'
                            ? 'bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-700/50'
                            : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50 dark:bg-[#0b141a] dark:text-gray-300 dark:ring-white/10 dark:hover:bg-white/5'
                            }`}
                    >
                        <Filter className="h-4 w-4" />
                        {statusFilter === 'all' ? 'Filter' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </button>

                    <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-12 left-0 w-40 bg-white dark:bg-[#111b21] rounded-lg shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden z-20"
                            >
                                <div className="p-1">
                                    {['all', 'active', 'inactive', 'blocked', 'new'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize ${statusFilter === status
                                                ? 'bg-gray-100 dark:bg-white/10 font-bold text-gray-900 dark:text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => {
                            setNewContact({ name: "", company: "", phone: "", status: "active", tags: "", value: "$0" });
                            setIsEditing(false);
                            setIsAddModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-md bg-[#02C173] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#02A060] transition-colors"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-0 bg-white dark:bg-[#0b141a] py-3 pl-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#02C173] sm:text-sm sm:leading-6 transition-colors"
                    placeholder="Search contacts by name, phone, or tags..."
                />
            </div>

            {/* List / Table */}
            <div className="flex-1 overflow-hidden rounded-[20px] bg-white dark:bg-[#0b141a] shadow ring-1 ring-gray-200 dark:ring-white/5 transition-colors flex flex-col">
                <div className="overflow-x-auto no-scrollbar">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
                            <thead className="bg-gray-50 dark:bg-white/5 transition-colors">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Last Active</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-[#0b141a] transition-colors">
                                {filteredContacts.map((person) => (
                                    <motion.tr
                                        key={person.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        whileHover={{ backgroundColor: "rgba(100,100,100,0.05)" }}
                                        className="cursor-pointer"
                                    >
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                            <div className="flex items-center gap-3">
                                                {person.avatar && !imageErrorIds.has(person.id) ? (
                                                    <img
                                                        src={person.avatar}
                                                        alt={person.name}
                                                        className="h-9 w-9 rounded-full object-cover"
                                                        onError={() => setImageErrorIds(prev => new Set(prev).add(person.id))}
                                                    />
                                                ) : (
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${getAvatarColor(person.name)}`}>
                                                        {person.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white">{person.name}</div>

                                                    <div className="text-xs text-gray-500">{person.company}</div>
                                                    <div className="flex gap-1 mt-0.5">
                                                        {person.tags?.map(tag => (
                                                            <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[10px] uppercase font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-white/10 transition-colors">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {person.phone || "—"}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize
                        ${person.status === 'active' || person.status === 'new' ? 'bg-[#02C173]/10 text-[#02C173] ring-[#02C173]/20' :
                                                    person.status === 'blocked' ? 'bg-red-400/10 text-red-400 ring-red-400/20' :
                                                        'bg-blue-400/10 text-blue-400 ring-blue-400/20'}`}>
                                                {person.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{person.last_contact}</td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveActionId(activeActionId === person.id ? null : person.id);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>

                                                {/* Action Dropdown */}
                                                <AnimatePresence>
                                                    {activeActionId === person.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="absolute right-0 top-8 z-50 w-36 rounded-lg bg-white dark:bg-[#1f2c34] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-white/5"
                                                        >
                                                            <div className="py-1">
                                                                <button
                                                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                                                                    onClick={() => {
                                                                        openEditModal(person);
                                                                        setActiveActionId(null);
                                                                    }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                                                                    onClick={() => {
                                                                        router.push(`/dashboard/chats?chatId=${person.id}`);
                                                                        setActiveActionId(null);
                                                                    }}
                                                                >
                                                                    Message
                                                                </button>
                                                                <button
                                                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                                    onClick={() => {
                                                                        handleDeleteContact(person.id, person.name);
                                                                        setActiveActionId(null);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                                {filteredContacts.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-gray-500">
                                            No contacts found matching "{searchQuery}" {statusFilter !== 'all' && `with status "${statusFilter}"`}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#111b21] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? "Edit Contact" : "Add New Contact"}</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleSaveContact} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                            value={newContact.company}
                                            onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                        <Phone size={14} /> Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                        <Tag size={14} /> Tags (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                        value={newContact.tags}
                                        onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                                        placeholder="vip, lead, customer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0b141a] px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#02C173]"
                                        value={newContact.status}
                                        onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                                    >
                                        <option value="new">New Lead</option>
                                        <option value="active">Active</option>
                                        <option value="connected">Connected</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-[#02C173] hover:bg-[#02A060] text-white font-bold py-2.5 rounded-lg transition-colors shadow-lg shadow-[#02C173]/20"
                                    >
                                        {isEditing ? "Save Changes" : "Add Contact"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
