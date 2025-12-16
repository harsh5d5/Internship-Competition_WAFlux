"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreVertical, Phone, Video, Paperclip, Mic, Send } from "lucide-react";

// Mock Data
const chats = [
    {
        id: 1,
        name: "Alice Smith",
        avatar: "AS",
        lastMessage: "Is this available in red?",
        time: "10:30 AM",
        unread: 2,
        online: true,
        messages: [
            { id: 1, text: "Hi, I saw your ad for the summer sale.", sender: "user", time: "10:00 AM" },
            { id: 2, text: "Hello Alice! Yes, we have some great deals.", sender: "me", time: "10:05 AM" },
            { id: 3, text: "Is this available in red?", sender: "user", time: "10:30 AM" },
        ]
    },
    {
        id: 2,
        name: "Bob Jones",
        avatar: "BJ",
        lastMessage: "Thanks for the info!",
        time: "Yesterday",
        unread: 0,
        online: false,
        messages: [
            { id: 1, text: "Do you offer bulk discounts?", sender: "user", time: "Yesterday" },
            { id: 2, text: "Yes, for orders over 50 units.", sender: "me", time: "Yesterday" },
            { id: 3, text: "Thanks for the info!", sender: "user", time: "Yesterday" },
        ]
    },
    {
        id: 3,
        name: "Charlie Day",
        avatar: "CD",
        lastMessage: "When will it ship?",
        time: "Yesterday",
        unread: 0,
        online: true,
        messages: []
    },
];

export default function ChatsPage() {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(1);
    const [inputText, setInputText] = useState("");

    const selectedChat = chats.find(c => c.id === selectedChatId);

    return (
        <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-[20px] bg-white dark:bg-[#0b141a] border border-gray-200 dark:border-white/5 shadow-2xl transition-colors">
            {/* Left Sidebar: Chat List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-white/5 flex flex-col bg-gray-50 dark:bg-[#111b21] transition-colors">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#1f2c34] transition-colors">
                    <div className="font-bold text-gray-900 dark:text-white text-lg">Chats</div>
                    <div className="flex gap-2 text-gray-400">
                        <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            className="w-full bg-white dark:bg-[#1f2c34] text-gray-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2 border border-gray-200 dark:border-none focus:ring-1 focus:ring-[#02C173] placeholder-gray-500 transition-colors"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#1f2c34] transition-colors border-b border-gray-200 dark:border-white/5 
                 ${selectedChatId === chat.id ? 'bg-gray-100 dark:bg-[#1f2c34]' : ''}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-white font-medium transition-colors">
                                    {chat.avatar}
                                </div>
                                {chat.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#02C173] border-2 border-[#111b21] rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-gray-900 dark:text-white font-medium truncate">{chat.name}</h4>
                                    <span className={`text-xs ${chat.unread > 0 ? 'text-[#02C173]' : 'text-gray-500'}`}>{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-[#02C173] rounded-full flex items-center justify-center text-xs text-black font-bold">
                                    {chat.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Area: Chat Window */}
            <div className="flex-1 flex flex-col bg-[#e5ddd5] dark:bg-[#0b141a] relative transition-colors">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>

                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#1f2c34] z-10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-white text-sm transition-colors">
                                    {selectedChat.avatar}
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-medium">{selectedChat.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedChat.online ? 'Online' : 'Last seen today at 10:30 AM'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-gray-400">
                                <Video className="w-5 h-5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                                <Phone className="w-5 h-5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
                            {selectedChat.messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-sm 
                        ${msg.sender === 'me'
                                            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-white rounded-tr-none'
                                            : 'bg-white dark:bg-[#1f2c34] text-gray-900 dark:text-white rounded-tl-none'}`}
                                    >
                                        <p>{msg.text}</p>
                                        <span className="text-[10px] text-gray-500 dark:text-white/50 block text-right mt-1">{msg.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-gray-50 dark:bg-[#1f2c34] z-10 flex items-center gap-3 transition-colors">
                            <Paperclip className="w-6 h-6 text-gray-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message"
                                className="flex-1 bg-white dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#02C173] border border-gray-200 dark:border-none transition-colors"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && inputText.trim()) {
                                        // Mock send functionality
                                        // In real app, this would append to messages list
                                        setInputText("");
                                    }
                                }}
                            />
                            {inputText.trim() ? (
                                <div className="p-2 bg-[#02C173] rounded-full cursor-pointer hover:bg-[#02A060]">
                                    <Send className="w-5 h-5 text-white dark:text-black" />
                                </div>
                            ) : (
                                <Mic className="w-6 h-6 text-gray-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors" />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
