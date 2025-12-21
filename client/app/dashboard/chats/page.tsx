"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Paperclip, MoreVertical, Phone, Video,
    Smile, Mic, Check, CheckCheck, Menu, User,
    MessageSquare, Bell, LogOut, ChevronLeft, Info,
    FileText, Image as ImageIcon, ArrowDownRight, Camera,
    Send, X, Zap, LayoutGrid, Settings, Tag, DollarSign, Trash2,
    Reply, Copy, Forward, Pin, Star, CheckSquare, BellOff, Clock, Heart, XCircle, ThumbsDown, Ban, MinusCircle,
    CheckCircle, AlertCircle
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/lib/config";

function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function ChatsPage() {
    const searchParams = useSearchParams();
    const paramChatId = searchParams.get('chatId');

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [isRecording, setIsRecording] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
    const [isForwarding, setIsForwarding] = useState(false);
    const [forwardMessage, setForwardMessage] = useState<any>(null);
    const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
    const [messageInfoId, setMessageInfoId] = useState<string | null>(null);
    const [toasts, setToasts] = useState<any[]>([]);
    const [confirmConfig, setConfirmConfig] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const confirmAction = (title: string, message: string, onConfirm: () => void) => {
        setConfirmConfig({ title, message, onConfirm });
    };

    // Helper to mark as read
    const markChatAsRead = async (id: string) => {
        const token = localStorage.getItem("access_token");
        try {
            await fetch(`${API_URL}/api/leads/${id}/read`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` }
            });

        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    // Clear Chat Functionality
    // Lead / Chat Actions
    const handleDeleteChat = async (id: string) => {
        confirmAction(
            "Delete Chat?",
            "Are you sure you want to delete this entire chat conversation? This action cannot be undone.",
            async () => {
                const token = localStorage.getItem("access_token");
                try {
                    await fetch(`${API_URL}/api/leads/${id}`, {
                        method: 'DELETE',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    setChats(prev => prev.filter(c => c.id !== id));
                    setSelectedChatId(null);
                    setShowChatMenu(false);
                    showToast("Chat deleted", "info");
                } catch (err) {
                    console.error("Failed to delete chat", err);
                }
            }
        );
    };

    const handleBlockContact = async (id: string) => {
        confirmAction(
            "Block Contact?",
            "Block this contact? You will no longer receive messages from them.",
            async () => {
                const token = localStorage.getItem("access_token");
                try {
                    await fetch(`${API_URL}/api/leads/${id}/block`, {
                        method: 'POST',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    showToast("Contact blocked", "info");
                    setShowChatMenu(false);
                    fetchChats();
                } catch (err) {
                    console.error("Failed to block contact", err);
                }
            }
        );
    };

    const handleReportContact = async (id: string) => {
        confirmAction(
            "Report Contact?",
            "Report this contact for spam or abuse?",
            async () => {
                const token = localStorage.getItem("access_token");
                try {
                    await fetch(`${API_URL}/api/leads/${id}/report`, {
                        method: 'POST',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    showToast("Contact reported", "warning");
                    setShowChatMenu(false);
                } catch (err) {
                    console.error("Failed to report contact", err);
                }
            }
        );
    };

    // Message Actions
    const handleDeleteMessage = async (leadId: string, msgId: string) => {
        confirmAction(
            "Delete Message?",
            "Are you sure you want to delete this message? This action cannot be undone.",
            async () => {
                const token = localStorage.getItem("access_token");
                try {
                    await fetch(`${API_URL}/api/leads/${leadId}/messages/${msgId}`, {
                        method: 'DELETE',
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    setChats(prev => prev.map(chat => {
                        if (chat.id === leadId) {
                            return { ...chat, messages: chat.messages.filter((m: any) => m.id !== msgId) };
                        }
                        return chat;
                    }));
                    setActiveMessageMenuId(null);
                    showToast("Message deleted", "info");
                } catch (err) {
                    console.error("Failed to delete message", err);
                }
            }
        );
    };

    const handleCopyMessage = (text: string) => {
        navigator.clipboard.writeText(text);
        setActiveMessageMenuId(null);
        showToast("Copied to clipboard", "info");
    };

    const handleStarMessage = async (leadId: string, msgId: string, currentState: boolean) => {
        const token = localStorage.getItem("access_token");
        try {
            await fetch(`${API_URL}/api/leads/${leadId}/messages/${msgId}/star`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ starred: !currentState })
            });
            setChats(prev => prev.map(chat => {
                if (chat.id === leadId) {
                    return {
                        ...chat,
                        messages: chat.messages.map((m: any) => m.id === msgId ? { ...m, starred: !currentState } : m)
                    };
                }
                return chat;
            }));
            setActiveMessageMenuId(null);
        } catch (err) {
            console.error("Failed to star message", err);
        }
    };

    const handlePinMessage = async (leadId: string, msgId: string, currentState: boolean) => {
        const token = localStorage.getItem("access_token");
        try {
            await fetch(`${API_URL}/api/leads/${leadId}/messages/${msgId}/pin`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ pinned: !currentState })
            });
            setChats(prev => prev.map(chat => {
                if (chat.id === leadId) {
                    return {
                        ...chat,
                        messages: chat.messages.map((m: any) => m.id === msgId ? { ...m, pinned: !currentState } : m)
                    };
                }
                return chat;
            }));
            setActiveMessageMenuId(null);
        } catch (err) {
            console.error("Failed to pin message", err);
        }
    };

    const handleReactToMessage = async (leadId: string, msgId: string, emoji: string) => {
        const token = localStorage.getItem("access_token");
        try {
            await fetch(`${API_URL}/api/leads/${leadId}/messages/${msgId}/react`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ emoji })
            });
            setChats(prev => prev.map(chat => {
                if (chat.id === leadId) {
                    return {
                        ...chat,
                        messages: chat.messages.map((m: any) => {
                            if (m.id === msgId) {
                                const reactions = m.reactions || [];
                                return { ...m, reactions: [...new Set([...reactions, emoji])] };
                            }
                            return m;
                        })
                    };
                }
                return chat;
            }));
            setActiveMessageMenuId(null);
        } catch (err) {
            console.error("Failed to react to message", err);
        }
    };

    const toggleMessageSelection = (msgId: string) => {
        setSelectedMessageIds(prev => {
            const next = new Set(prev);
            if (next.has(msgId)) next.delete(msgId);
            else next.add(msgId);
            return next;
        });
    };

    const handleClearChat = async (id: string) => {
        confirmAction(
            "Clear Chat?",
            "Are you sure you want to clear all messages in this chat?",
            async () => {
                const token = localStorage.getItem("access_token");

                // Optimistic UI update - Clear immediately
                setChats(prev => prev.map(chat => {
                    if (chat.id === id) {
                        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return { ...chat, messages: [], lastMessage: "Chat cleared", time: now };
                    }
                    return chat;
                }));
                setShowChatMenu(false);

                try {
                    const res = await fetch(`${API_URL}/api/leads/${id}/messages`, {
                        method: 'DELETE',
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (res.ok) {
                        showToast("Chat history cleared", "success");
                    } else {
                        fetchChats();
                    }
                } catch (err) {
                    console.error("Failed to clear chat", err);
                    fetchChats();
                }
            }
        );
    };

    const handleForwardMessage = async (targetChatId: string) => {
        if (!forwardMessage) return;
        const token = localStorage.getItem("access_token");
        try {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await fetch(`${API_URL}/api/leads/${targetChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: forwardMessage.text + "\n\n*(Forwarded)*",
                    sender: 'me',
                    time: time,
                    attachment: forwardMessage.attachment
                })
            });
            setIsForwarding(false);
            setForwardMessage(null);
            showToast("Message forwarded successfully", "success");
            fetchChats();
        } catch (err) {
            console.error("Failed to forward", err);
        }
    };

    const groupMessagesByDate = (messages: any[]) => {
        const groups: { [key: string]: any[] } = {};
        messages.forEach(msg => {
            let dateLabel = "Today";
            if (msg.timestamp) {
                const date = new Date(msg.timestamp * 1000);
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);

                if (date.toDateString() === today.toDateString()) {
                    dateLabel = "Today";
                } else if (date.toDateString() === yesterday.toDateString()) {
                    dateLabel = "Yesterday";
                } else {
                    dateLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
                }
            } else if (msg.time === "Yesterday") {
                dateLabel = "Yesterday";
            }

            if (!groups[dateLabel]) groups[dateLabel] = [];
            groups[dateLabel].push(msg);
        });
        return groups;
    };

    const formatChatTime = (timestamp: number, fallback: string) => {
        if (!timestamp) return fallback;
        const date = new Date(timestamp * 1000);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Fetch Chats (Leads) with Polling
    const fetchChats = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${API_URL}/api/leads`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.status === 401) {
                // router.push("/login"); // Optional: handle redirect
                return;
            }
            const data = await res.json();

            const formattedChats = data.map((lead: any) => ({
                id: lead.id || lead._id,
                name: lead.name,
                avatar: lead.avatar || (lead.name ? lead.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() : "U"),
                company: lead.company || "Unknown",
                role: lead.role || "Lead",
                email: lead.email || "No email",
                phone: lead.phone || "No phone",
                value: lead.value || "$0",
                status: lead.status || "active",
                tags: lead.tags || [],
                lastMessage: lead.messages?.length > 0 ? lead.messages[lead.messages.length - 1].text : "No messages",
                time: formatChatTime(lead.updated_at, lead.last_contact || "12:00 PM"),
                unread: lead.id === selectedChatId ? 0 : (lead.unread || 0), // FIX: Force 0 if active
                online: Math.random() > 0.7,
                messages: lead.messages || []
            }));

            // Check if active chat has unread messages on server and mark read
            const activeChatData = data.find((d: any) => d.id === selectedChatId);
            if (activeChatData && activeChatData.unread > 0) {
                markChatAsRead(selectedChatId!);
            }

            setChats(formattedChats);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    useEffect(() => {
        fetchChats();
        const interval = setInterval(fetchChats, 3000);
        return () => clearInterval(interval);
    }, [selectedChatId]); // FIX: Add dependency to update closure

    // Initial load selection logic separate to avoid re-selecting constantly
    useEffect(() => {
        if (chats.length > 0 && !selectedChatId && !paramChatId) {
            // handleSelectChat(chats[0].id, chats); // Optional: auto-select first
        }
    }, [chats.length]);

    useEffect(() => {
        if (paramChatId && chats.length > 0) {
            handleSelectChat(paramChatId, chats);
        }
    }, [paramChatId, chats.length]);

    const selectedChat = chats.find(c => c.id === selectedChatId);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat?.messages]);

    // Handle selecting a chat
    const handleSelectChat = async (id: string, currentChats = chats) => {
        setSelectedChatId(id);

        // Optimistic update
        setChats(prevChats => prevChats.map(chat => {
            if (chat.id === id) {
                return { ...chat, unread: 0 };
            }
            return chat;
        }));

        // API Call to mark as read
        await markChatAsRead(id);
    };

    // Handle Send Message
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!inputMessage.trim() && !fileInputRef.current?.files?.length) return;

        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMessage = {
            id: Date.now(),
            sender: 'me',
            text: inputMessage,
            time: formattedTime,
            timestamp: now.getTime() / 1000,
            status: 'sent',
            avatar: "https://i.pravatar.cc/150?u=me"
        };

        // Optimistic UI update - Move to top
        const activeChat = chats.find(c => c.id === selectedChatId);
        if (activeChat) {
            const updatedChat = {
                ...activeChat,
                messages: [...activeChat.messages, newMessage],
                lastMessage: inputMessage,
                time: newMessage.time
            };

            const otherChats = chats.filter(c => c.id !== selectedChatId);
            setChats([updatedChat, ...otherChats]);
        }

        setInputMessage("");

        // Sync with backend
        try {
            const token = localStorage.getItem("access_token");
            await fetch(`${API_URL}/api/leads/${selectedChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: newMessage.text,
                    sender: 'me',
                    time: newMessage.time,
                    reply_to: replyingToMessage?.id
                })
            });
            setReplyingToMessage(null);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    // Handle File Upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();

            // Send message with attachment
            const newMessage = {
                id: Date.now(),
                sender: 'me',
                text: "",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now() / 1000,
                status: 'sent',
                avatar: "https://i.pravatar.cc/150?u=me",
                attachment: {
                    type: data.type,
                    url: data.url,
                    name: data.name
                }
            };

            // Optimistic UI update - Move to top
            const activeChat = chats.find(c => c.id === selectedChatId);
            if (activeChat) {
                const updatedChat = {
                    ...activeChat,
                    messages: [...activeChat.messages, newMessage],
                    lastMessage: "📎 Attachment",
                    lastMessageTime: newMessage.time
                };

                const otherChats = chats.filter(c => c.id !== selectedChatId);
                setChats([updatedChat, ...otherChats]);
            }
            setShowAttachments(false);

            // Sync with backend
            await fetch(`${API_URL}/api/leads/${selectedChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: "",
                    sender: 'me',
                    time: newMessage.time,
                    attachment: {
                        type: data.type,
                        url: data.url,
                        name: data.name
                    }
                })
            });

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        }

        // Reset input
        event.target.value = '';
    };

    // Filter Logic
    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All"
            ? true
            : activeFilter === "Unread" ? chat.unread > 0
                : chat.tags && chat.tags.includes("vip");
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] overflow-hidden rounded-xl bg-background border border-border shadow-2xl font-sans text-foreground relative">
            {/* LEFT SIDEBAR - CHAT LIST */}
            <div className={classNames(
                "w-full lg:w-[340px] border-r border-border flex flex-col bg-card shrink-0 transition-all duration-300",
                selectedChatId ? "hidden lg:flex" : "flex"
            )}>

                {/* Search & Filter Header */}
                <div className="p-3 bg-card space-y-3 z-10">
                    <div className="flex items-center justify-between px-2 pt-2">
                        <h2 className="font-bold text-xl text-foreground tracking-wide">Chats</h2>
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors relative">
                            <MoreVertical className="w-5 h-5" />
                            {showMenu && (
                                <div className="absolute right-0 top-10 w-48 bg-popover rounded-lg shadow-xl py-2 z-50 border border-border text-popover-foreground">
                                    <button className="w-full text-left px-4 py-3 hover:bg-muted text-sm flex items-center gap-3"><LayoutGrid className="w-4 h-4" /> Dashboard</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-muted text-sm flex items-center gap-3"><Settings className="w-4 h-4" /> Settings</button>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="relative group px-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-secondary text-foreground text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none transition-all placeholder-muted-foreground/60"
                        />
                    </div>
                    <div className="flex gap-2 px-1 pb-1 overflow-x-auto no-scrollbar">
                        {["All", "Unread", "VIP"].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 text-xs font-medium transition-all rounded-full border border-transparent whitespace-nowrap
                                    ${activeFilter === filter
                                        ? 'bg-secondary text-primary'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="h-px bg-[#202c33] mx-1"></div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleSelectChat(chat.id)}
                            className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-secondary/50 
                                ${selectedChatId === chat.id ? 'bg-secondary' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center font-medium text-lg text-gray-300 overflow-hidden">
                                    {chat.avatar.length > 2 ? (
                                        <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        chat.avatar
                                    )}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 border-b border-border pb-3 -mb-3">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-base font-normal text-foreground truncate">{chat.name}</h4>
                                    <span className={`text-xs ${chat.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <div className="min-w-[1.2rem] h-[1.2rem] px-1 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                                            {chat.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className={classNames(
                "flex-1 flex flex-col bg-background relative transition-all duration-300",
                selectedChatId ? "flex" : "hidden lg:flex"
            )}>
                {/* WhatsApp Doodle Background */}
                <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.06] bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-repeat bg-[length:400px_auto] pointer-events-none"></div>

                {selectedChat ? (
                    <>
                        <AnimatePresence>
                            {isMultiSelectMode && (
                                <motion.div
                                    initial={{ y: -60 }}
                                    animate={{ y: 0 }}
                                    exit={{ y: -60 }}
                                    className="h-16 flex items-center justify-between px-6 bg-secondary z-[100] border-b border-border absolute top-0 left-0 right-0 shadow-lg"
                                >
                                    <div className="flex items-center gap-6">
                                        <X className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => { setIsMultiSelectMode(false); setSelectedMessageIds(new Set()); }} />
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-medium text-sm">{selectedMessageIds.size} selected</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-7">
                                        <Star
                                            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-yellow-500 transition-colors"
                                            onClick={async () => {
                                                const token = localStorage.getItem("access_token");
                                                for (const id of Array.from(selectedMessageIds)) {
                                                    await fetch(`${API_URL}/api/leads/${selectedChat.id}/messages/${id}/star`, {
                                                        method: 'PUT',
                                                        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                                                        body: JSON.stringify({ starred: true })
                                                    });
                                                }
                                                fetchChats();
                                                setIsMultiSelectMode(false);
                                                setSelectedMessageIds(new Set());
                                                showToast(`${selectedMessageIds.size} messages starred`, "success");
                                            }}
                                        />
                                        <Forward
                                            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                            onClick={() => {
                                                // Take the first selected message for simplicity in forward
                                                const firstId = Array.from(selectedMessageIds)[0];
                                                const msg = selectedChat.messages.find((m: any) => m.id === firstId);
                                                if (msg) setForwardMessage(msg);
                                                setIsForwarding(true);
                                                setIsMultiSelectMode(false);
                                                setSelectedMessageIds(new Set());
                                            }}
                                        />
                                        <Trash2
                                            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-red-400 transition-colors"
                                            onClick={() => {
                                                confirmAction(
                                                    "Delete Multiple?",
                                                    `Do you want to delete ${selectedMessageIds.size} selected messages?`,
                                                    async () => {
                                                        const token = localStorage.getItem("access_token");
                                                        for (const id of Array.from(selectedMessageIds)) {
                                                            await fetch(`${API_URL}/api/leads/${selectedChat.id}/messages/${id}`, {
                                                                method: 'DELETE',
                                                                headers: { "Authorization": `Bearer ${token}` }
                                                            });
                                                        }
                                                        fetchChats();
                                                        setIsMultiSelectMode(false);
                                                        setSelectedMessageIds(new Set());
                                                        showToast("Selected messages deleted", "info");
                                                    }
                                                );
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="h-16 flex items-center justify-between px-2 lg:px-6 bg-secondary z-50 shrink-0 shadow-sm relative">
                            <div
                                className="flex items-center gap-2 lg:gap-4 cursor-pointer flex-1 min-w-0"
                            >
                                <button
                                    onClick={() => setSelectedChatId(null)}
                                    className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0" onClick={() => setShowRightSidebar(!showRightSidebar)}>
                                    <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center font-medium text-sm text-gray-300 overflow-hidden shrink-0">
                                        {selectedChat.avatar.length > 2 ? (
                                            <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                                        ) : (
                                            selectedChat.avatar
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-sm lg:text-base font-semibold text-foreground truncate">{selectedChat.name}</h3>
                                        <div className="flex items-center gap-1.5 leading-tight">
                                            <div className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse"></div>
                                            <span className="text-[10px] lg:text-xs text-[#00a884] font-medium">online</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pr-2">
                                <Phone className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                                <div className="w-px h-6 bg-border"></div>
                                <div className="relative z-[120]">
                                    <MoreVertical
                                        id="chat-header-more"
                                        onClick={() => setShowChatMenu(!showChatMenu)}
                                        className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                    />
                                    {showChatMenu && (
                                        <>
                                            <div className="fixed inset-0 z-[90]" onClick={() => setShowChatMenu(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 top-full mt-2 w-64 bg-popover rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.5)] py-2 z-[130] border border-border text-popover-foreground overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setShowRightSidebar(true);
                                                        setShowChatMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] text-sm flex items-center gap-3 transition-colors"
                                                >
                                                    <Info className="w-4 h-4" /> Contact info
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsMultiSelectMode(true);
                                                        setShowChatMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] text-sm flex items-center gap-3 transition-colors"
                                                >
                                                    <CheckSquare className="w-4 h-4" /> Select messages
                                                </button>

                                                <div className="h-px bg-[#202c33] mx-2 my-1"></div>

                                                <button onClick={() => handleReportContact(selectedChat.id)} className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] text-sm flex items-center gap-3 transition-colors">
                                                    <ThumbsDown className="w-4 h-4" /> Report
                                                </button>
                                                <button onClick={() => handleBlockContact(selectedChat.id)} className="w-full text-left px-4 py-2.5 hover:bg-[#111b21] text-sm flex items-center gap-3 transition-colors">
                                                    <Ban className="w-4 h-4" /> Block
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleClearChat(selectedChat.id);
                                                        setShowChatMenu(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-sm flex items-center gap-3 text-red-400 transition-colors group"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Clear chat
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteChat(selectedChat.id)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-sm flex items-center gap-3 text-red-400 transition-colors group"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Delete chat
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar relative z-10">
                            {Object.entries(groupMessagesByDate(selectedChat.messages)).map(([date, msgs]) => (
                                <div key={date} className="space-y-1">
                                    <div className="flex justify-center my-4 sticky top-0 z-20">
                                        <span className="bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-lg shadow-sm border border-border">{date}</span>
                                    </div>

                                    {msgs.map((msg: any) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => isMultiSelectMode && toggleMessageSelection(msg.id)}
                                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2 ${isMultiSelectMode ? 'cursor-pointer' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 max-w-[85%]">
                                                {isMultiSelectMode && (
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMessageIds.has(msg.id) ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                        {selectedMessageIds.has(msg.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                                                    </div>
                                                )}
                                                <div className={`px-3 pt-2 pb-1.5 text-[14.2px] rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative group
                                                    ${msg.sender === 'me'
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                        : 'bg-card text-foreground rounded-tl-none'}
                                                    ${isMultiSelectMode && selectedMessageIds.has(msg.id) ? 'ring-2 ring-primary' : ''}`}
                                                >
                                                    {/* Attachment Rendering */}
                                                    {msg.attachment && (
                                                        <div className="mb-1 rounded overflow-hidden">
                                                            {msg.attachment.type && msg.attachment.type.startsWith('image') ? (
                                                                <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-full h-auto rounded-lg max-h-64 object-cover" />
                                                            ) : (msg.attachment.url ? (
                                                                <div className="flex items-center gap-3 bg-black/10 p-3 rounded-lg">
                                                                    <div className="bg-red-500/20 p-2 rounded text-red-400">
                                                                        <FileText className="w-6 h-6" />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="font-medium truncate text-sm">{msg.attachment.name}</p>
                                                                        <p className="text-xs opacity-70 uppercase">{msg.attachment.type.split('/')[1] || 'FILE'}</p>
                                                                    </div>
                                                                    <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="ml-auto p-2 hover:bg-black/10 rounded-full">
                                                                        <ArrowDownRight className="w-5 h-5" />
                                                                    </a>
                                                                </div>
                                                            ) : null)}
                                                        </div>
                                                    )}

                                                    <div className="relative min-w-[90px] flex flex-col">
                                                        <div className="pr-[64px] pb-1">
                                                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                                                        </div>
                                                        <div className="absolute bottom-0 right-[-4px] flex items-center gap-1 shrink-0 px-1 pb-0.5 select-none">
                                                            <span className="text-[10.5px] opacity-60 font-medium tabular-nums whitespace-nowrap">
                                                                {msg.time === "Just now" && msg.timestamp
                                                                    ? new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                    : msg.time}
                                                            </span>
                                                            {msg.sender === 'me' && (
                                                                <div className="flex scale-[0.7] origin-right ml-0.5">
                                                                    {msg.status === 'read' ? (
                                                                        <CheckCheck className="w-4 h-4 text-sky-400 dark:text-[#53bdeb] stroke-[3]" />
                                                                    ) : msg.status === 'delivered' ? (
                                                                        <CheckCheck className="w-4 h-4 text-muted-foreground stroke-[3]" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4 text-muted-foreground stroke-[3]" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Message Actions Dropdown */}
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                        <div
                                                            onClick={() => setActiveMessageMenuId(activeMessageMenuId === msg.id ? null : msg.id)}
                                                            className="bg-black/20 hover:bg-black/30 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                                                        >
                                                            <ArrowDownRight className="w-3 h-3 rotate-90" />
                                                        </div>

                                                        <AnimatePresence>
                                                            {activeMessageMenuId === msg.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-[90]" onClick={() => setActiveMessageMenuId(null)}></div>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                        className={`absolute top-8 ${msg.sender === 'me' ? 'right-0' : 'left-0'} w-44 bg-popover rounded-xl shadow-2xl py-2 z-[100] border border-border text-popover-foreground overflow-hidden`}
                                                                    >
                                                                        <button onClick={() => { setMessageInfoId(msg.id); setActiveMessageMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Info className="w-4 h-4" /> Message info
                                                                        </button>
                                                                        <button onClick={() => { setReplyingToMessage(msg); setActiveMessageMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Reply className="w-4 h-4" /> Reply
                                                                        </button>
                                                                        <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Copy className="w-4 h-4" /> Copy
                                                                        </button>
                                                                        <button onClick={() => { setReactionPickerId(msg.id); setActiveMessageMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Smile className="w-4 h-4" /> React
                                                                        </button>
                                                                        <button onClick={() => { setForwardMessage(msg); setIsForwarding(true); setActiveMessageMenuId(null); }} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Forward className="w-4 h-4" /> Forward
                                                                        </button>
                                                                        <button onClick={() => handlePinMessage(selectedChat.id, msg.id, msg.pinned)} className="w-full text-left px-4 py-2 hover:bg-[#111b21] text-sm flex items-center gap-3 transition-colors">
                                                                            <Pin className={`w-4 h-4 ${msg.pinned ? 'text-[#00a884]' : ''}`} /> {msg.pinned ? 'Unpin' : 'Pin'}
                                                                        </button>
                                                                        <button onClick={() => handleStarMessage(selectedChat.id, msg.id, msg.starred)} className="w-full text-left px-4 py-2 hover:bg-muted text-sm flex items-center gap-3 transition-colors">
                                                                            <Star className={`w-4 h-4 ${msg.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} /> {msg.starred ? 'Unstar' : 'Star'}
                                                                        </button>
                                                                        <div className="h-px bg-border my-1 mx-2"></div>
                                                                        <button onClick={() => handleDeleteMessage(selectedChat.id, msg.id)} className="w-full text-left px-4 py-2 hover:bg-destructive/10 text-sm flex items-center gap-3 text-destructive transition-colors">
                                                                            <Trash2 className="w-4 h-4" /> Delete
                                                                        </button>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>

                                                    {/* Reaction Picker Overlay */}
                                                    <AnimatePresence>
                                                        {reactionPickerId === msg.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-[110]" onClick={() => setReactionPickerId(null)}></div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                                                    className={`absolute -top-12 ${msg.sender === 'me' ? 'right-0' : 'left-0'} flex gap-2 bg-[#233138] p-2 rounded-full shadow-2xl z-[120] border border-[#303d45]`}
                                                                >
                                                                    {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={() => {
                                                                                handleReactToMessage(selectedChat.id, msg.id, emoji);
                                                                                setReactionPickerId(null);
                                                                            }}
                                                                            className="text-xl hover:scale-125 transition-transform p-1"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Message Info Modal */}
                                                    <AnimatePresence>
                                                        {messageInfoId === msg.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-[150] bg-black/60 flex items-center justify-center p-4" onClick={() => setMessageInfoId(null)}>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        className="bg-popover w-full max-w-sm rounded-2xl shadow-2xl border border-border p-6 space-y-4"
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <h3 className="text-xl font-semibold text-foreground">Message Info</h3>
                                                                            <button onClick={() => setMessageInfoId(null)} className="text-muted-foreground hover:text-foreground">
                                                                                <X className="w-6 h-6" />
                                                                            </button>
                                                                        </div>
                                                                        <div className="space-y-4 text-muted-foreground">
                                                                            <div className="flex justify-between border-b border-border pb-2">
                                                                                <span>Status</span>
                                                                                <span className="capitalize text-primary">{msg.status}</span>
                                                                            </div>
                                                                            <div className="flex justify-between border-b border-[#303d45] pb-2">
                                                                                <span>Sent</span>
                                                                                <span>{msg.time}</span>
                                                                            </div>
                                                                            <div className="flex justify-between border-b border-[#303d45] pb-2">
                                                                                <span>Date</span>
                                                                                <span>{new Date(msg.timestamp * 1000).toLocaleDateString()}</span>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* Reply Context inside Bubble */}
                                                    {msg.reply_to && (
                                                        <div className="mb-2 p-2 rounded bg-black/5 dark:bg-black/20 border-l-4 border-primary opacity-80 cursor-pointer" onClick={() => {
                                                            const element = document.getElementById(`msg-${msg.reply_to}`);
                                                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                            element?.classList.add('ring-2', 'ring-primary');
                                                            setTimeout(() => element?.classList.remove('ring-2', 'ring-primary'), 2000);
                                                        }}>
                                                            {(() => {
                                                                const repliedMsg = selectedChat.messages.find((m: any) => m.id === msg.reply_to);
                                                                return (
                                                                    <>
                                                                        <p className="text-primary text-[11px] font-bold uppercase">{repliedMsg?.sender === 'me' ? 'You' : selectedChat.name}</p>
                                                                        <p className="text-xs line-clamp-1">{repliedMsg?.text || '📎 Attachment'}</p>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                    {/* Reactions Display */}
                                                    {msg.reactions && msg.reactions.length > 0 && (
                                                        <div className={`absolute -bottom-2 ${msg.sender === 'me' ? 'right-0' : 'left-0'} flex gap-1 bg-card rounded-full px-1.5 py-0.5 shadow-sm border border-border scale-90`}>
                                                            {msg.reactions.map((emoji: string, i: number) => (
                                                                <span key={i} className="text-xs">{emoji}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Pin/Star Icons */}
                                                    <div className="absolute top-1 left-1 flex gap-1 opacity-60">
                                                        {msg.pinned && <Pin className="w-3 h-3 text-primary" />}
                                                        {msg.starred && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="min-h-[62px] px-4 py-2 bg-secondary z-50 flex items-end relative">
                            {/* Attachment Menu */}
                            <AnimatePresence>
                                {showAttachments && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-20 left-4 flex flex-col gap-4 mb-2 z-50">
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 group">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-purple-600 to-purple-500 shadow-lg flex items-center justify-center text-white transition-transform group-hover:-translate-y-1">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                        </button>
                                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 group">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-t from-pink-600 to-pink-500 shadow-lg flex items-center justify-center text-white transition-transform group-hover:-translate-y-1">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

                            <button onClick={() => setShowAttachments(!showAttachments)} className={`p-2 rounded-full transition-colors hover:bg-muted mb-1 text-muted-foreground ${showAttachments ? 'text-primary' : ''}`}>
                                <Paperclip className={`w-6 h-6 transition-transform ${showAttachments ? 'rotate-45' : ''}`} />
                            </button>

                            <div className="flex-1 flex flex-col mb-1.5 min-w-0 mx-2">
                                <AnimatePresence>
                                    {replyingToMessage && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-card border-l-4 border-primary rounded-t-lg px-3 py-2 flex items-center justify-between mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-primary text-xs font-medium">{replyingToMessage.sender === 'me' ? 'You' : selectedChat.name}</p>
                                                <p className="text-muted-foreground text-sm truncate">{replyingToMessage.text || '📎 Attachment'}</p>
                                            </div>
                                            <button onClick={() => setReplyingToMessage(null)} className="text-muted-foreground hover:text-foreground ml-2"><X className="w-4 h-4" /></button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className={`bg-background rounded-lg flex items-center ${replyingToMessage ? 'rounded-t-none' : ''}`}>
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Type a message"
                                        className="flex-1 bg-transparent text-foreground px-4 py-2.5 text-[15px] focus:outline-none placeholder-muted-foreground"
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                    />
                                </div>
                            </div>

                            {inputMessage.trim() ? (
                                <button onClick={() => handleSendMessage()} className="p-3 mb-1.5 bg-primary hover:bg-primary/90 rounded-full text-primary-foreground transition-transform active:scale-95 shadow-lg">
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            ) : (
                                <button onClick={() => setIsRecording(!isRecording)} className={`p-3 mb-1.5 rounded-full transition-colors hover:bg-muted ${isRecording ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    <Mic className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center z-10 relative overflow-hidden">
                        {/* Pulsing Radiant Glow */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute w-[600px] h-[600px] bg-[#00a884]/20 rounded-full blur-[120px] pointer-events-none z-0"
                        />

                        <div className="w-[450px] text-center relative z-20 bg-card/40 backdrop-blur-sm p-12 rounded-3xl border border-border shadow-2xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="mb-8"
                            >
                                <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(0,168,132,0.3)]">
                                    <MessageSquare className="w-12 h-12 text-primary-foreground" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <h1 className="text-5xl font-black text-foreground mb-2 tracking-tighter">
                                    WELCOME
                                </h1>
                                <div className="flex items-center justify-center gap-3 mb-8">
                                    <div className="h-px w-8 bg-primary/30"></div>
                                    <p className="text-primary font-bold tracking-[0.2em] text-[10px] uppercase">
                                        WBIZZ Business Suite
                                    </p>
                                    <div className="h-px w-8 bg-primary/30"></div>
                                </div>

                                <p className="text-muted-foreground leading-relaxed text-sm max-w-[300px] mx-auto">
                                    Select a chat from the left to start messaging. Your conversations are synced across all your devices.
                                </p>
                            </motion.div>
                        </div>

                        <div className="absolute bottom-10 flex flex-col items-center gap-4 text-muted-foreground text-[10px] tracking-[0.3em] uppercase font-bold">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-8 bg-border"></div>
                                <div className="flex items-center gap-1.5 opacity-60">
                                    <Zap className="w-3 h-3 text-primary" />
                                    <span>End-to-end encrypted</span>
                                </div>
                                <div className="h-px w-8 bg-border"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CRM INTELLIGENCE PANEL */}
            <AnimatePresence>
                {showRightSidebar && selectedChat && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-0 lg:static z-[150] lg:z-0 lg:w-[320px] bg-card border-l border-border flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-none"
                    >
                        <div className="h-16 flex items-center justify-between px-6 bg-secondary shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowRightSidebar(false)} className="text-muted-foreground hover:text-foreground transition-colors outline-none">
                                    <X className="w-5 h-5" />
                                </button>
                                <h3 className="font-medium text-foreground text-base">Contact Info</h3>
                            </div>
                            <div className="relative z-[120]">
                                <MoreVertical
                                    id="sidebar-more"
                                    onClick={() => setShowChatMenu(!showChatMenu)}
                                    className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                />
                                {showChatMenu && (
                                    <>
                                        <div className="fixed inset-0 z-[110]" onClick={() => setShowChatMenu(false)}></div>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 top-full mt-2 w-56 bg-popover rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_24px_rgba(0,0,0,0.5)] py-2 z-[130] border border-border text-popover-foreground overflow-hidden"
                                        >
                                            <button
                                                onClick={() => {
                                                    handleClearChat(selectedChat.id);
                                                    setShowChatMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors text-sm flex items-center gap-3 text-destructive group"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Clear Chat
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="text-center pt-4">
                                <div className="w-32 h-32 rounded-full bg-[#2a3942] mx-auto flex items-center justify-center text-4xl text-gray-300 mb-4 shadow-xl overflow-hidden">
                                    {selectedChat.avatar.length > 2 ? (
                                        <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedChat.avatar
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-foreground mb-1">{selectedChat.name}</h2>
                                <p className="text-muted-foreground">{selectedChat.phone}</p>
                            </div>

                            <div className="p-4 bg-secondary rounded-lg space-y-1 shadow-sm">
                                <span className="text-muted-foreground text-xs uppercase font-medium">Email</span>
                                <p className="text-foreground text-sm">{selectedChat.email}</p>
                            </div>

                            <div className="p-4 bg-secondary rounded-lg space-y-1 shadow-sm">
                                <span className="text-muted-foreground text-xs uppercase font-medium">About</span>
                                <textarea
                                    defaultValue={selectedChat.notes}
                                    className="w-full bg-transparent border-none p-0 text-foreground text-sm focus:ring-0 resize-none h-20 placeholder-muted-foreground/50"
                                    placeholder="Add notes..."
                                />
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => handleBlockContact(selectedChat.id)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary rounded-lg text-destructive transition-colors text-sm font-medium">
                                    <Ban className="w-5 h-5" />
                                    Block {selectedChat.name}
                                </button>
                                <button onClick={() => handleReportContact(selectedChat.id)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary rounded-lg text-destructive transition-colors text-sm font-medium">
                                    <ThumbsDown className="w-5 h-5" />
                                    Report contact
                                </button>
                                <button onClick={() => handleDeleteChat(selectedChat.id)} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-secondary rounded-lg text-destructive transition-colors text-sm font-medium">
                                    <Trash2 className="w-5 h-5" />
                                    Delete Chat
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Forwarding Modal */}
            <AnimatePresence>
                {isForwarding && (
                    <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-popover w-full max-w-md rounded-2xl shadow-2xl border border-border flex flex-col max-h-[80vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary">
                                <h3 className="text-xl font-semibold text-foreground">Forward message to</h3>
                                <button onClick={() => setIsForwarding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-background">
                                {chats.map(chat => (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleForwardMessage(chat.id)}
                                        className="w-full flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center text-xl text-white overflow-hidden shadow-inner">
                                            {chat.avatar?.length > 2 ? <img src={chat.avatar} className="w-full h-full object-cover" /> : chat.avatar || <User className="w-6 h-6 text-gray-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{chat.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{chat.phone}</p>
                                        </div>
                                        <Forward className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md min-w-[280px]
                                ${toast.type === 'success' ? 'bg-[#00a884]/90 border-[#00a884] text-white' :
                                    toast.type === 'error' ? 'bg-destructive/90 border-destructive text-white' :
                                        toast.type === 'warning' ? 'bg-yellow-500/90 border-yellow-500 text-black' :
                                            'bg-secondary/95 border-border text-foreground'}`}
                        >
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                            <span className="text-sm font-medium">{toast.message}</span>
                            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto opacity-70 hover:opacity-100 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmConfig && (
                    <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#233138] w-full max-w-sm rounded-2xl shadow-2xl border border-[#303d45] p-6 space-y-6"
                        >
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-foreground">{confirmConfig.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{confirmConfig.message}</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setConfirmConfig(null)}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors font-medium border border-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmConfig.onConfirm();
                                        setConfirmConfig(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-destructive hover:bg-destructive/90 text-white transition-colors font-bold shadow-lg shadow-destructive/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
