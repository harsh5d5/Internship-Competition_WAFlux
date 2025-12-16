"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Home, Trello, Send, FileText, Workflow } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

// Helper for class names since I don't know if they have a lib/utils
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "CRM Board", href: "/dashboard/kanban", icon: Trello },
    { name: "Automation", href: "/automation", icon: Workflow },
    { name: "Contacts", href: "/dashboard/contacts", icon: Users },
    { name: "Chats", href: "/dashboard/chats", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetch("http://localhost:8000/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    if (res.status === 401) {
                        localStorage.removeItem("access_token");
                        window.location.href = "/login";
                        throw new Error("Session expired");
                    }
                    throw new Error("Failed to fetch user");
                })
                .then((data) => {
                    setUser(data);
                })
                .catch((err) => {
                    console.error("Error fetching user:", err);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
            // Optional: Redirect to login if no token acts as a barrier
            // window.location.href = "/login"; 
        }
    }, []);

    // Helper to get initial
    const getInitial = () => {
        if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return "U";
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-[#1f2937] bg-white dark:bg-[#0b141a] text-black dark:text-white shadow-sm transition-colors duration-300">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-gray-200 dark:border-[#1f2937] px-6 transition-colors">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#02C173]">
                    <span>WAFlux</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                                isActive
                                    ? "bg-[#02C173]/10 text-[#02C173]"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white",
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                            )}
                        >
                            <item.icon
                                className={classNames(
                                    isActive ? "text-[#02C173]" : "text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white",
                                    "mr-3 h-5 w-5 flex-shrink-0"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 h-8 w-1 bg-[#02C173] rounded-r-md"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div className="border-t border-gray-200 dark:border-[#1f2937] p-4 transition-colors">
                <div className="mb-4 flex items-center justify-between px-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Theme</span>
                    <ThemeToggle className="h-8 w-8" />
                </div>

                {/* User Profile Snippet */}
                {loading ? (
                    // Loading State
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-black/5 dark:bg-white/5 p-3 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-20 rounded bg-gray-300 dark:bg-gray-700" />
                            <div className="h-2 w-24 rounded bg-gray-300 dark:bg-gray-700" />
                        </div>
                    </div>
                ) : user ? (
                    // Loaded State
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-black/5 dark:bg-white/5 p-3 transition-colors">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#02C173] to-[#128C7E] font-bold text-white shadow-lg">
                            {getInitial()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-semibold text-black dark:text-white">
                                {user.full_name || "User"}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                ) : (
                    // Error/Fallback State
                    <div className="mb-4 flex items-center gap-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 p-3 border border-yellow-100 dark:border-yellow-900/20">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-bold">
                            !
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                Session Locked
                            </p>
                            <button
                                onClick={() => window.location.href = "/login"}
                                className="text-xs text-yellow-600 hover:underline font-medium"
                            >
                                Sig-in again &rarr;
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("token_type");
                        window.location.href = "/login";
                    }}
                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
                    Sign out
                </button>
            </div>
        </div>
    );
}
