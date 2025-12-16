"use client";

import { motion } from "framer-motion";
import { Save, User, Smartphone, Bell, Shield, Key } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [apiConfig, setApiConfig] = useState({
        phoneId: "",
        businessId: "",
        accessToken: ""
    });

    const [profile, setProfile] = useState({
        displayName: "John Doe",
        email: "john@example.com"
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    const [notifications, setNotifications] = useState({
        newMessages: true,
        campaignReports: false,
        desktopNotifs: true
    });

    const handleSave = () => {
        console.log("Saving Settings:", { apiConfig, profile, notifications });
        alert("Settings Saved! (Check Console)");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
                    <p className="text-sm text-gray-400">Manage your account and integration preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-[#02C173] hover:bg-[#02A060] text-black font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>

            {/* Grid of Settings Cards */}
            <div className="grid gap-6">

                {/* 1. WhatsApp API Configuration (Critical) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0b141a] border border-white/5 rounded-[20px] p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2 bg-[#02C173]/10 rounded-lg">
                            <Smartphone className="w-6 h-6 text-[#02C173]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">WhatsApp API Configuration</h2>
                            <p className="text-sm text-gray-400">Connect your WhatsApp Business Account</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                            <span className="text-sm text-red-400 font-medium">Disconnected</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Phone Number ID</label>
                            <input
                                type="text"
                                value={apiConfig.phoneId}
                                onChange={(e) => setApiConfig({ ...apiConfig, phoneId: e.target.value })}
                                placeholder="e.g. 1029384756..."
                                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#02C173] focus:border-[#02C173] outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">WhatsApp Business Account ID</label>
                            <input
                                type="text"
                                value={apiConfig.businessId}
                                onChange={(e) => setApiConfig({ ...apiConfig, businessId: e.target.value })}
                                placeholder="e.g. 192837465..."
                                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#02C173] focus:border-[#02C173] outline-none"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-300">Permanent Access Token</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={apiConfig.accessToken}
                                    onChange={(e) => setApiConfig({ ...apiConfig, accessToken: e.target.value })}
                                    placeholder="EAAG..."
                                    className="w-full bg-[#111b21] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-1 focus:ring-[#02C173] focus:border-[#02C173] outline-none font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Get this from your Meta Developer Dashboard.</p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Profile Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0b141a] border border-white/5 rounded-[20px] p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
                            <p className="text-sm text-gray-400">Update your personal information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 md:col-span-2 mb-2">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#02C173] to-[#128C7E] flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden relative group">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    profile.displayName.substring(0, 2).toUpperCase()
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    <span className="text-xs text-white">Edit</span>
                                </div>
                            </div>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <button
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                className="text-sm text-[#02C173] font-semibold hover:underline"
                            >
                                Change Avatar
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Display Name</label>
                            <input
                                type="text"
                                value={profile.displayName}
                                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#02C173] focus:border-[#02C173] outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-[#02C173] focus:border-[#02C173] outline-none"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* 3. Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0b141a] border border-white/5 rounded-[20px] p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Bell className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Notifications</h2>
                            <p className="text-sm text-gray-400">Manage how you get alerted</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-medium text-white">New Message Alerts</h3>
                                <p className="text-xs text-gray-500">Get notified when a customer replies</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.newMessages}
                                    onChange={(e) => setNotifications({ ...notifications, newMessages: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#02C173] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02C173]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-medium text-white">Campaign Delivery Reports</h3>
                                <p className="text-xs text-gray-500">Weekly summary of campaign performance</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.campaignReports}
                                    onChange={(e) => setNotifications({ ...notifications, campaignReports: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#02C173] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02C173]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <h3 className="text-sm font-medium text-white">Browser Desktop Notifications</h3>
                                <p className="text-xs text-gray-500">Show popups even when tab is closed</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notifications.desktopNotifs}
                                    onChange={(e) => setNotifications({ ...notifications, desktopNotifs: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#02C173] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02C173]"></div>
                            </label>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
