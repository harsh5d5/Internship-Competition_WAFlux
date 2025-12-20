"use client";

import { useState, useEffect, useRef } from "react";
import { Save, CheckCircle, User, Lock, Camera, Loader2, X, Key } from "lucide-react";

type Tab = "profile";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("profile");


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
        fetchUserProfile();
    }, []);


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



    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 font-sans text-gray-200 relative min-h-screen">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Manage your profile and security</p>
                </div>
            </div>


            {/* Content Area */}
            <div className="space-y-8">

                {/* --- PROFILE TAB --- */}
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
        </div>
    );
}
