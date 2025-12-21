"use client";

import { useState, useEffect, useRef } from "react";
import {
    Save, CheckCircle, User, Lock, Camera, Loader2, X, Key, Eye, EyeOff,
    Database, Users, Trash2, Download, Sparkles, ShieldAlert, FileText
} from "lucide-react";

type Tab = "profile" | "data" | "team";

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
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [passwordError, setPasswordError] = useState("");
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // --- Data & Privacy State ---
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // --- Handlers ---

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

    const handleExportLeads = async () => {
        const token = localStorage.getItem("access_token");
        try {
            // Dynamically import jsPDF and autoTable
            const { default: jsPDF } = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            // Fetch data from the new JSON endpoint
            const response = await fetch("http://localhost:8000/api/leads/all", {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error("Export request failed");
                return;
            }

            const data = await response.json();
            const contacts = data.contacts || [];

            // Initialize PDF
            const doc = new jsPDF();

            // Add Header
            doc.setFontSize(20);
            doc.setTextColor(2, 193, 115); // WBIZZ Green
            doc.text("WBIZZ Executive Report", 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Total Contacts: ${contacts.length}`, 14, 34);

            // Add a line separator
            doc.setDrawColor(200);
            doc.line(14, 38, 196, 38);

            // Prepare table data
            const tableData = contacts.map((contact: any) => [
                contact.name || 'Unknown',
                contact.company || '-',
                contact.role || 'Lead',
                contact.status || 'New',
                contact.phone || '-',
                contact.email || '-',
                (contact.tags || []).join(', ') || '-'
            ]);

            // Add table using autoTable
            (doc as any).autoTable({
                head: [['Name', 'Company', 'Role', 'Status', 'Phone', 'Email', 'Tags']],
                body: tableData,
                startY: 42,
                theme: 'striped',
                headStyles: {
                    fillColor: [2, 193, 115],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });

            // Add footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount} | Generated by WBIZZ Automation Engine`,
                    14,
                    doc.internal.pageSize.height - 10
                );
            }

            // Save the PDF
            doc.save('WBIZZ_Leads_Report.pdf');
        } catch (err) {
            console.error("PDF generation failed", err);
        }
    };

    const handleDeleteAccount = async () => {
        const token = localStorage.getItem("access_token");
        setIsDeletingAccount(true);
        try {
            const res = await fetch("http://localhost:8000/users/me", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                localStorage.clear();
                window.location.href = "/login";
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsDeletingAccount(false);
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
            const uploadRes = await fetch("http://localhost:8000/api/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                const avatarUrl = data.url;

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
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 font-sans text-foreground relative min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and security</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-card/50 border border-border p-1 rounded-2xl w-fit overflow-x-auto max-w-full">
                <button
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    <User size={16} /> Profile
                </button>
                <button
                    onClick={() => setActiveTab("data")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'data' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    <Database size={16} /> Data & Privacy
                </button>
                <button
                    onClick={() => setActiveTab("team")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'team' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    <Users size={16} /> Team
                </button>
            </div>

            <div className="space-y-8 min-h-[500px]">
                {/* --- PROFILE TAB --- */}
                {activeTab === "profile" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-secondary flex items-center justify-center relative">
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : user?.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-muted-foreground" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-card shadow-lg group-hover:scale-110 transition-transform">
                                    <Camera className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl font-bold text-foreground mb-1">{user?.full_name || "User"}</h2>
                                <p className="text-muted-foreground mb-4">{user?.username || user?.email}</p>
                                <button onClick={handleAvatarClick} className="text-sm text-primary hover:underline font-medium">
                                    Change Profile Photo
                                </button>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
                            <form onSubmit={handleProfileSave} className="space-y-6 max-w-2xl">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                        <input
                                            type="email"
                                            value={user?.username || ""}
                                            disabled
                                            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-muted-foreground cursor-not-allowed opacity-70"
                                        />
                                        <p className="text-xs text-muted-foreground/60">Email cannot be changed.</p>
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
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                                    >
                                        {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">Password</h3>
                                <p className="text-muted-foreground text-sm">Update your password securely.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-mono text-muted-foreground tracking-widest hidden md:inline opacity-50">•••••••••••••</span>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="border border-border hover:bg-muted text-foreground px-4 py-2 rounded-xl transition-colors text-sm font-semibold shadow-sm"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- DATA & PRIVACY TAB --- */}
                {activeTab === "data" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Export Your Data</h3>
                                    <p className="text-muted-foreground text-sm">Download a professional PDF report with all your leads and contact information.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-secondary/30 rounded-2xl border border-border gap-4">
                                <div>
                                    <h4 className="font-semibold text-foreground">WBIZZ Executive Report</h4>
                                    <p className="text-sm text-muted-foreground">Generate a professional PDF report with all your contact data, formatted for business use.</p>
                                </div>
                                <button
                                    onClick={handleExportLeads}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    <FileText className="w-4 h-4" /> Download PDF Report
                                </button>
                            </div>
                        </div>

                        <div className="bg-red-500/[0.03] border border-red-500/20 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-500">Danger Zone</h3>
                                    <p className="text-muted-foreground text-sm">Irreversible actions regarding your account and data.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between p-6 border border-red-500/20 rounded-2xl gap-4">
                                <div>
                                    <h4 className="font-semibold text-foreground">Delete Account</h4>
                                    <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Forever
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TEAM TAB --- */}
                {activeTab === "team" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                                <Users size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-4">Team Collaboration</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                Add agents and team members to help manage your customer conversations.
                            </p>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                                <Sparkles size={16} /> Coming Soon to WBIZZ Pro
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Components */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-popover border border-red-500/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Delete Account?</h3>
                        <p className="text-muted-foreground text-sm mb-8">This action is permanent and cannot be undone.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                            >
                                {isDeletingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Everything"}
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-4 rounded-2xl transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-popover border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/50">
                            <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                            {passwordError && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{passwordError}</div>}
                            {passwordSuccess && <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Password changed!</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                                <div className="relative">
                                    <input type={showPasswords.current ? "text" : "password"} required className="w-full bg-background border border-border rounded-lg pl-10 pr-12 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-sans" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} />
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">New Password</label>
                                <div className="relative">
                                    <input type={showPasswords.new ? "text" : "password"} required className="w-full bg-background border border-border rounded-lg pl-10 pr-12 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-sans" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                                <div className="relative">
                                    <input type={showPasswords.confirm ? "text" : "password"} required className="w-full bg-background border border-border rounded-lg pl-10 pr-12 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 transition-all font-sans" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={isSavingPassword || passwordSuccess} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg active:scale-95">
                                    {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
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
