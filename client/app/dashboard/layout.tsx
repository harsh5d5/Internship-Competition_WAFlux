"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/ui/Aurora";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login"); // Redirect to login if no token
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Prevent rendering dashboard content until auth is checked
    if (!isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-[#060707]">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02C173] border-t-transparent"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen overflow-hidden bg-white dark:bg-[#060707] text-black dark:text-white transition-colors duration-300">
            {/* Aurora Background Effect */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-60">
                <Aurora
                    colorStops={["#02C173", "#128C7E", "#02C173"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                />
            </div>

            <div className="relative z-10 flex h-full w-full">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        />
                    )}
                </AnimatePresence>

                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto relative no-scrollbar">
                    {/* Mobile Header Toggle */}
                    <div className="sticky top-0 z-30 flex items-center gap-4 bg-white/80 dark:bg-[#060707]/80 backdrop-blur-md px-4 py-3 lg:hidden border-b border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </button>
                        <div className="font-bold text-xl tracking-tight text-[#02C173]">
                            WBIZZ
                        </div>
                    </div>

                    <div className="h-full px-4 lg:px-8 py-4 lg:py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
