"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, Home, Trello, Send, FileText, Workflow } from "lucide-react";
import { motion } from "framer-motion";

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

    return (
        <div className="flex h-screen w-64 flex-col border-r border-[#1f2937] bg-[#0b141a] text-white shadow-sm">
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-[#1f2937] px-6">
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
                                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                            )}
                        >
                            <item.icon
                                className={classNames(
                                    isActive ? "text-[#02C173]" : "text-gray-400 group-hover:text-white",
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
            <div className="border-t border-[#1f2937] p-4">
                {/* User Profile Snippet */}
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#02C173] to-[#128C7E] font-bold text-white shadow-lg">
                        V
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-white">Vickky</p>
                        <p className="truncate text-xs text-gray-400">vickky@gmail.com</p>
                    </div>
                </div>

                <Link
                    href="/logout"
                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
                    Sign out
                </Link>
            </div>
        </div>
    );
}
