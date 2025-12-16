"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        <div className="flex h-screen overflow-hidden bg-white dark:bg-[#060707] text-black dark:text-white transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="h-full px-8 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
