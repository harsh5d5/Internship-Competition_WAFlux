"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, Phone, Video, Paperclip, Mic, Send, Info, Tag, DollarSign, X, Image as ImageIcon, FileText, Camera, LogOut, Check, CheckCheck, LayoutGrid, Settings, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatsPage() {
    const searchParams = useSearchParams();
    const paramChatId = searchParams.get('chatId');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [inputText, setInputText] = useState("");
    const [showRightSidebar, setShowRightSidebar] = useState(false);

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [isRecording, setIsRecording] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Fetch Chats (Leads) with Polling
    const fetchChats = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch("http://localhost:8000/api/leads", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                const leads = await res.json();
                const formattedChats = leads.map((lead: any) => ({
                    id: lead.id || lead._id,
                    name: lead.name,
                    avatar: lead.name ? lead.name.split(' ').map((n: any) => n[0]).join('').substring(0, 2).toUpperCase() : "U",
                    company: lead.company || "Unknown",
                    role: lead.role || "Lead",
                    email: lead.email || "No email",
                    phone: lead.phone || "No Phone",
                    lastMessage: lead.messages && lead.messages.length > 0
                        ? lead.messages[lead.messages.length - 1].text
                        : "Start a conversation",
                    time: lead.last_contact || "New",
                    unread: lead.unread || 0,
                    online: lead.status === 'Active',
                    status: lead.status || "New",
                    value: lead.value || "$0",
                    notes: lead.notes || "",
                    tags: lead.tags || [],
                    messages: lead.messages || []
                }));

                // Only update if data changed (simple check could be added, but for now just set)
                setChats(formattedChats);

                // Keep selected chat ID but update its content from new data if needed
                // (Handled by selectedChat derivation)
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    useEffect(() => {
        fetchChats(); // Initial fetch
        const interval = setInterval(fetchChats, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

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
    }, [paramChatId]);

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
        const token = localStorage.getItem("access_token");
        try {
            await fetch(`http://localhost:8000/api/leads/${id}/read`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    // Handle Send Message
    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedChatId) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage = {
            id: crypto.randomUUID(),
            text: inputText,
            sender: "me",
            time: timestamp,
            status: "sent"
        };

        const updatedChats = chats.map(chat => {
            if (chat.id === selectedChatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    lastMessage: inputText,
                    time: "Just now"
                };
            }
            return chat;
        });

        setChats(updatedChats);
        setInputText("");

        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`http://localhost:8000/api/leads/${selectedChatId}/messages`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newMessage)
            });

            if (res.ok) {
                setTimeout(() => {
                    setChats(prev => prev.map(c => {
                        if (c.id === selectedChatId) {
                            const updatedMsgs = c.messages.map((m: any) => m.id === newMessage.id ? { ...m, status: 'delivered' } : m);
                            return { ...c, messages: updatedMsgs };
                        }
                        return c;
                    }));
                }, 1000);
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
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
        <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-xl bg-[#111b21] border border-[#202c33] shadow-2xl font-sans text-gray-200">

            {/* LEFT SIDEBAR - CHAT LIST */}
            <div className="w-[340px] border-r border-[#202c33] flex flex-col bg-[#111b21] shrink-0">

                {/* Search & Filter Header */}
                <div className="p-3 bg-[#111b21] space-y-3 z-10">
                    <div className="flex items-center justify-between px-2 pt-2">
                        <h2 className="font-bold text-xl text-white tracking-wide">Chats</h2>
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
                            <MoreVertical className="w-5 h-5" />
                            {showMenu && (
                                <div className="absolute right-0 top-10 w-48 bg-[#202c33] rounded-lg shadow-xl py-2 z-50 border border-[#202c33] text-gray-300">
                                    <button className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-sm flex items-center gap-3"><LayoutGrid className="w-4 h-4" /> Dashboard</button>
                                    <button className="w-full text-left px-4 py-3 hover:bg-[#111b21] text-sm flex items-center gap-3"><Settings className="w-4 h-4" /> Settings</button>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="relative group px-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00a884] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#202c33] text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                    <div className="flex gap-2 px-1 pb-1 overflow-x-auto no-scrollbar">
                        {["All", "Unread", "VIP"].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 text-xs font-medium transition-all rounded-full border border-transparent whitespace-nowrap
                                    ${activeFilter === filter
                                        ? 'bg-[#202c33] text-[#00a884]'
                                        : 'text-gray-400 hover:bg-[#202c33] hover:text-gray-200'}`}
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
                            className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-all hover:bg-[#202c33] 
                                ${selectedChatId === chat.id ? 'bg-[#202c33]' : ''}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-[#2a3942] flex items-center justify-center font-medium text-lg text-gray-300">
                                    {chat.avatar}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 border-b border-[#202c33] pb-3 -mb-3">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-base font-normal text-white truncate">{chat.name}</h4>
                                    <span className={`text-xs ${chat.unread > 0 ? 'text-[#00a884]' : 'text-gray-500'}`}>{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-400 truncate max-w-[180px]">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <div className="min-w-[1.2rem] h-[1.2rem] px-1 bg-[#00a884] rounded-full flex items-center justify-center text-[10px] text-[#111b21] font-bold">
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
            <div className="flex-1 flex flex-col bg-[#0b141a] relative min-w-[450px]">
                {/* WhatsApp Doodle Background */}
                <div className="absolute inset-0 z-0 opacity-[0.06] bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-repeat bg-[length:400px_auto]"></div>

                {selectedChat ? (
                    <>
                        <div className="h-16 flex items-center justify-between px-4 py-2 bg-[#202c33] z-10 shrink-0 shadow-sm">
                            <div
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => setShowRightSidebar(!showRightSidebar)}
                            >
                                <div className="w-10 h-10 rounded-full bg-[#2a3942] flex items-center justify-center font-medium text-sm text-gray-300">
                                    {selectedChat.avatar}
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-base leading-tight">{selectedChat.name}</h3>
                                    <p className="text-xs text-gray-400 leading-tight mt-0.5">{selectedChat.role || 'click for info'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pr-2">
                                <Video className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                <Phone className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                                <div className="w-px h-6 bg-gray-600/30"></div>
                                <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar relative z-10">
                            <div className="flex justify-center my-4 sticky top-0 z-20">
                                <span className="bg-[#1f2c34] text-gray-400 text-xs px-3 py-1.5 rounded-lg shadow-sm border border-[#1f2c34]">Today</span>
                            </div>

                            {selectedChat.messages.map((msg: any) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2`}
                                >
                                    <div className={`max-w-[70%] px-2 pt-2 pb-1 text-sm rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] relative group
                                        ${msg.sender === 'me'
                                            ? 'bg-[#005c4b] text-white rounded-tr-none'
                                            : 'bg-[#202c33] text-gray-100 rounded-tl-none'}`}
                                    >
                                        <p className="leading-relaxed px-1 text-[14.2px]">{msg.text}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 pl-4 min-w-[4rem]">
                                            <span className={`text-[10px] ${msg.sender === 'me' ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</span>
                                            {msg.sender === 'me' && (
                                                <>
                                                    {msg.status === 'read' ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                    ) : msg.status === 'delivered' ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-gray-400" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="min-h-[62px] px-4 py-2 bg-[#202c33] z-10 flex items-end mb-0">
                            <button
                                className={`p-3 mr-2 rounded-full transition-colors hover:bg-[#374248] text-gray-400`}
                                onClick={() => setShowAttachments(!showAttachments)}
                            >
                                <Paperclip className="w-6 h-6" />
                            </button>
                            <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center mb-1.5">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message"
                                    className="flex-1 bg-transparent text-white px-4 py-2.5 text-[15px] focus:outline-none placeholder-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSendMessage();
                                    }}
                                />
                            </div>
                            {inputText.trim() ? (
                                <button
                                    onClick={handleSendMessage}
                                    className="p-3 ml-2 mb-1.5 bg-[#00a884] hover:bg-[#02906f] rounded-full text-[#111b21] transition-transform active:scale-95 shadow-lg"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            ) : (
                                <button
                                    className="p-3 ml-2 mb-1.5 rounded-full transition-colors hover:bg-[#374248] text-gray-400"
                                    onClick={() => setIsRecording(!isRecording)}
                                >
                                    <Mic className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 z-10">
                        {/* Empty State with Image */}
                        <div className="w-[300px] text-center">
                            <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae.svg" alt="Welcome" className="mx-auto opacity-20 mb-8" />
                            <h2 className="text-3xl font-light text-gray-300 mb-4">WAFlux <span className="text-xs align-top bg-[#202c33] px-2 py-1 rounded-full text-[#00a884]">BETA</span></h2>
                            <p className="text-sm text-gray-500">Send and receive messages without keeping your phone online.<br />Use WAFlux on up to 4 linked devices and 1 phone.</p>
                        </div>
                        <div className="absolute bottom-10 flex items-center gap-2 text-gray-600 text-xs">
                            <Zap className="w-3 h-3" /> End-to-end encrypted
                        </div>
                    </div>
                )}
            </div>

            {/* CRM INTELLIGENCE PANEL */}
            <AnimatePresence>
                {showRightSidebar && selectedChat && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-[#111b21] border-l border-[#202c33] flex flex-col shrink-0 overflow-hidden"
                    >
                        <div className="h-16 flex items-center gap-4 px-6 bg-[#202c33] shrink-0">
                            <button onClick={() => setShowRightSidebar(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="font-medium text-white text-base">Contact Info</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="text-center pt-4">
                                <div className="w-32 h-32 rounded-full bg-[#2a3942] mx-auto flex items-center justify-center text-4xl text-gray-300 mb-4 shadow-xl">
                                    {selectedChat.avatar}
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-1">{selectedChat.name}</h2>
                                <p className="text-gray-400">{selectedChat.phone}</p>
                            </div>

                            <div className="p-4 bg-[#202c33] rounded-lg space-y-1 shadow-sm">
                                <span className="text-gray-400 text-xs uppercase font-medium">Email</span>
                                <p className="text-white text-sm">{selectedChat.email}</p>
                            </div>

                            <div className="p-4 bg-[#202c33] rounded-lg space-y-1 shadow-sm">
                                <span className="text-gray-400 text-xs uppercase font-medium">About</span>
                                <textarea
                                    defaultValue={selectedChat.notes}
                                    className="w-full bg-transparent border-none p-0 text-white text-sm focus:ring-0 resize-none h-20 placeholder-gray-600"
                                    placeholder="Add notes..."
                                />
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] rounded-lg text-red-400 transition-colors text-sm font-medium">
                                    <LogOut className="w-5 h-5" />
                                    Block {selectedChat.name}
                                </button>
                                <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] rounded-lg text-red-400 transition-colors text-sm font-medium">
                                    <Check className="w-5 h-5" />
                                    Report contact
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
