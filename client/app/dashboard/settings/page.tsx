"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Info, CheckCircle, AlertCircle, Key, Phone, Building, User, Lock, Camera, LogOut, Loader2, X } from "lucide-react";

type Tab = "profile" | "whatsapp";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // --- WhatsApp Config State ---
    const [config, setConfig] = useState({
        phone_number_id: "",
        business_account_id: "",
        access_token: ""
    });
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isSavedConfig, setIsSavedConfig] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");

    // --- Profile State ---
    const [user, setUser] = useState<{ username: string; email: string; full_name?: string; avatar?: string } | null>(null);
    const [fullName, setFullName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isProfileSaved, setIsProfileSaved] = useState(false);

    // --- Password State ---
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [passwordError, setPasswordError] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // --- File Upload ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchConfig();
        fetchUserProfile();
    }, []);

    const fetchConfig = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/api/config/whatsapp", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.is_configured && data.phone_number_id && data.business_account_id && data.access_token) {
                    setConfig({
                        phone_number_id: data.phone_number_id || "",
                        business_account_id: data.business_account_id || "",
                        access_token: data.access_token || ""
                    });
                    setStatus("connected");
                } else {
                    setStatus("disconnected");
                }
            }
        } catch (error) {
            console.error("Failed to load settings", error);
        }
    };

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFullName(data.full_name || "");
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };

    // --- Profile Handlers ---

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch("http://localhost:8000/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ full_name: fullName })
            });

            if (res.ok) {
                setIsProfileSaved(true);
                setTimeout(() => setIsProfileSaved(false), 3000);
                fetchUserProfile(); // Refresh
                window.dispatchEvent(new Event("profileUpdated"));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const token = localStorage.getItem("access_token");
        const formData = new FormData();
        formData.append("file", file);

        try {
            // 1. Upload
            const uploadRes = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                const avatarUrl = data.url;

                // 2. Update User Profile with new URL
                const updateRes = await fetch("http://localhost:8000/users/me", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ avatar: avatarUrl })
                });

                if (updateRes.ok) {
                    fetchUserProfile();
                    window.dispatchEvent(new Event("profileUpdated"));
                }
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess(false);

        if (passwords.new !== passwords.confirm) {
            setPasswordError("New passwords do not match");
            return;
        }
        if (passwords.new.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            return;
        }

        setIsSavingPassword(true);
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch("http://localhost:8000/users/me/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwords.current,
                    new_password: passwords.new
                })
            });

            if (res.ok) {
                setPasswordSuccess(true);
                setPasswords({ current: "", new: "", confirm: "" });
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess(false);
                }, 2000);
            } else {
                const data = await res.json();
                setPasswordError(data.detail || "Failed to update password");
            }
        } catch (err) {
            setPasswordError("An error occurred");
        } finally {
            setIsSavingPassword(false);
        }
    };


    // --- WhatsApp Handlers ---

    const handleConfigSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const idRegex = /^\d{10,25}$/;

        if (!idRegex.test(config.phone_number_id.trim())) {
            alert("Invalid Phone Number ID. It must be a 10-25 digit number.");
            return;
        }
        if (!idRegex.test(config.business_account_id.trim())) {
            alert("Invalid Business Account ID.");
            return;
        }
        if (!config.access_token.trim().startsWith("EAA") || config.access_token.length < 20) {
            alert("Invalid Access Token. It should start with 'EAA'.");
            return;
        }

        setIsLoadingConfig(true);
        const token = localStorage.getItem("access_token");

        try {
            const res = await fetch("http://localhost:8000/api/config/whatsapp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                setIsSavedConfig(true);
                setStatus("connected");
                setTimeout(() => setIsSavedConfig(false), 3000);
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Save error", error);
            alert("Error saving settings");
        } finally {
            setIsLoadingConfig(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans text-gray-200 relative min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your profile and integrations</p>
                </div>
                {/* Connection Status (Only relevant for WhatsApp, but globally useful to see) */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status === 'connected' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {status === 'connected' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium text-sm capitalize">{status === 'connected' ? 'System Online' : 'System Offline'}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-[#202c33]">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === "profile" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile & Security
                    </div>
                    {activeTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a884] rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab("whatsapp")}
                    className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === "whatsapp" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        WhatsApp Configuration
                    </div>
                    {activeTab === "whatsapp" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a884] rounded-t-full"></div>}
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-8">

                {/* --- PROFILE TAB --- */}
                {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                        {/* 1. Avatar Card */}
                        <div className="bg-[#1f2c34] border border-[#202c33] rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#111b21] shadow-xl bg-[#202c33] flex items-center justify-center relative">
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-[#00a884] animate-spin" />
                                    ) : user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-500" />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-[#00a884] p-2 rounded-full border-4 border-[#1f2c34] shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera className="w-4 h-4 text-[#111b21]" />
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-white mb-1">{user?.full_name || "User"}</h2>
                                <p className="text-gray-400 mb-4">{user?.username || user?.email}</p>
                                <button onClick={handleAvatarClick} className="text-sm text-[#00a884] hover:underline">
                                    Change Profile Photo
                                </button>
                            </div>
                        </div>

                        {/* 2. Personal Information */}
                        <div className="bg-[#1f2c34] border border-[#202c33] rounded-xl p-8">
                            <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
                            <form onSubmit={handleProfileSave} className="space-y-6 max-w-2xl">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.username || ""} // Mapping username as email
                                            disabled // Email is usually immutable or requires separate verification flow
                                            className="w-full bg-[#111b21]/50 border border-[#2a3942] rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-600">Email cannot be changed.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    {isProfileSaved && (
                                        <span className="text-green-400 text-sm flex items-center gap-1 mr-4 animate-fadeIn">
                                            <CheckCircle className="w-4 h-4" /> Saved
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* 3. Security */}
                        <div className="bg-[#1f2c34] border border-[#202c33] rounded-xl p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Password</h3>
                                <p className="text-gray-400 text-sm">Update your password securely.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-gray-500 tracking-widest hidden md:inline">•••••••••••••</span>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="border border-[#2a3942] hover:bg-[#202c33] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- WHATSAPP CONFIG TAB (Existing Logic) --- */}
                {activeTab === "whatsapp" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">

                        {/* Explainer Section */}
                        <div className="bg-[#1f2c34] border border-[#202c33] rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-[#00a884]" />
                                WhatsApp API Configuration
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 text-sm">
                                <div className="space-y-4">
                                    <p className="text-gray-300 leading-relaxed">
                                        <strong className="text-white block mb-1">Log in like a new device</strong>
                                        This connects your WhatsApp Business number to WAFlux so we can send messages for you.
                                    </p>
                                    <div className="p-4 bg-[#111b21] rounded-lg border border-[#202c33]">
                                        <h3 className="font-medium text-white mb-2">My System User Token</h3>
                                        <p className="text-gray-400 text-xs leading-relaxed">Ensure you use a permanent System User Token with <code>whatsapp_business_messaging</code> permissions. Temporary tokens will disconnect after 24 hours.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <ul className="space-y-3">
                                        <li className="flex gap-3">
                                            <div className="mt-0.5 p-1.5 bg-[#202c33] rounded text-gray-300">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="block text-white font-medium">Phone Number ID</span>
                                                <span className="text-gray-400 text-xs">From Meta Developer Portal.</span>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-0.5 p-1.5 bg-[#202c33] rounded text-gray-300">
                                                <Building className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="block text-white font-medium">Business Account ID</span>
                                                <span className="text-gray-400 text-xs">Portfolio Business ID.</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Configuration Form */}
                        <form onSubmit={handleConfigSave} className="bg-[#1f2c34] border border-[#202c33] rounded-xl p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Phone Number ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 1029384756..."
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors placeholder-gray-600"
                                        value={config.phone_number_id}
                                        onChange={e => setConfig({ ...config, phone_number_id: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">WhatsApp Business Account ID</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 192837465..."
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors placeholder-gray-600"
                                        value={config.business_account_id}
                                        onChange={e => setConfig({ ...config, business_account_id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Permanent Access Token</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        placeholder="EAAG..."
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors placeholder-gray-600 font-mono text-sm"
                                        value={config.access_token}
                                        onChange={e => setConfig({ ...config, access_token: e.target.value })}
                                    />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                                <p className="text-xs text-gray-500 text-right">
                                    Don't have a token? <button type="button" onClick={() => setShowHelp(true)} className="text-[#00a884] hover:underline">See Guide</button>
                                </p>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#2a3942] mt-6">
                                {isSavedConfig && (
                                    <span className="text-green-400 text-sm flex items-center gap-1 animate-fadeIn">
                                        <CheckCircle className="w-4 h-4" /> Saved successfully
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoadingConfig}
                                    className={`flex items-center gap-2 bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-3 px-8 rounded-full transition-all active:scale-95 shadow-lg ${isLoadingConfig ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoadingConfig ? (
                                        <div className="w-5 h-5 border-2 border-[#111b21] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1f2c34] border border-[#2a3942] rounded-xl w-full max-w-md shadow-2xl scale-100">
                        <div className="p-6 border-b border-[#2a3942] flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                            {passwordError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Password changed!
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Current Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                                        value={passwords.current}
                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                    />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">New Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                                        value={passwords.new}
                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword || passwordSuccess}
                                    className="bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Help Sidebar (Slide-over) - Reused existing logic but kept compact */}
            <div className={`fixed inset-y-0 right-0 w-[500px] bg-[#111b21] border-l border-[#202c33] shadow-2xl transform transition-transform duration-300 ease-in-out z-50 p-6 overflow-y-auto ${showHelp ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Setup Guide</h2>
                    <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-[#202c33] rounded-full text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {/* ... existing guide content ... */}
                <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#00a884] text-[#111b21] font-bold flex items-center justify-center">1</span>
                            <h3 className="text-lg font-semibold text-white">Create Meta App</h3>
                        </div>
                        <ul className="list-disc pl-12 space-y-2 text-gray-400 text-sm">
                            <li>Go to <a href="https://developers.facebook.com" target="_blank" className="text-[#00a884] hover:underline">developers.facebook.com</a></li>
                        </ul>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#00a884] text-[#111b21] font-bold flex items-center justify-center">3</span>
                            <h3 className="text-lg font-semibold text-white">Get Permanent Token</h3>
                        </div>
                        <div className="pl-12 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
                            <p className="text-red-400 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> STOP! Do not use the temporary token.
                            </p>
                        </div>
                        <ul className="list-disc pl-12 space-y-2 text-gray-400 text-sm">
                            <li>Go to <a href="https://business.facebook.com/settings/system-users" target="_blank" className="text-[#00a884] hover:underline">Business Settings</a> → Users → System Users.</li>
                            <li>Add a new Admin user and click "Generate New Token".</li>
                            <li>Select your App & check permissions: <br /><code className="bg-[#202c33] px-1 rounded">whatsapp_business_messaging</code></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {showHelp && (
                <div onClick={() => setShowHelp(false)} className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"></div>
            )}
        </div>
    );
}
