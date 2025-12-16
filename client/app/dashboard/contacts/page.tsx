"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Search, UserPlus, Filter } from "lucide-react";

export interface Contact {
    id: string;
    name: string;
    phone: string;
    status: 'active' | 'inactive' | 'blocked';
    tags: string[];
    lastSeen: string;
}

const contacts: Contact[] = [
    { id: '1', name: 'Alice Smith', phone: '+1 (555) 123-4567', status: 'active', tags: ['vip', 'lead'], lastSeen: '2 mins ago' },
    { id: '2', name: 'Bob Jones', phone: '+1 (555) 987-6543', status: 'active', tags: ['new'], lastSeen: '1 hour ago' },
    { id: '3', name: 'Charlie Day', phone: '+1 (555) 456-7890', status: 'blocked', tags: ['spam'], lastSeen: '2 days ago' },
    { id: '4', name: 'Diana Prince', phone: '+1 (555) 222-3333', status: 'inactive', tags: ['customer'], lastSeen: '1 week ago' },
    { id: '5', name: 'Evan Wright', phone: '+1 (555) 444-5555', status: 'active', tags: ['lead'], lastSeen: '3 hours ago' },
];

export default function ContactsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Contacts</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your audience and leads</p>
                </div>
                <div className="flex gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-[#0b141a] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-md bg-[#02C173] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#02A060] transition-colors">
                        <UserPlus className="h-4 w-4" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full rounded-md border-0 bg-white dark:bg-[#0b141a] py-3 pl-10 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#02C173] sm:text-sm sm:leading-6 transition-colors"
                    placeholder="Search contacts by name, phone, or tags..."
                />
            </div>

            {/* List / Table */}
            <div className="overflow-hidden rounded-[20px] bg-white dark:bg-[#0b141a] shadow ring-1 ring-gray-200 dark:ring-white/5 transition-colors">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
                    <thead className="bg-gray-50 dark:bg-white/5 transition-colors">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Last Active</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5 bg-white dark:bg-[#0b141a] transition-colors">
                        {contacts.map((person) => (
                            <motion.tr
                                key={person.id}
                                whileHover={{ backgroundColor: "rgba(100,100,100,0.05)" }}
                                className="cursor-pointer"
                            >
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white transition-colors">
                                            {person.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">{person.name}</div>
                                            <div className="flex gap-1 mt-0.5">
                                                {person.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-white/10 transition-colors">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{person.phone}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset 
                    ${person.status === 'active' ? 'bg-[#02C173]/10 text-[#02C173] ring-[#02C173]/20' :
                                            person.status === 'blocked' ? 'bg-red-400/10 text-red-400 ring-red-400/20' :
                                                'bg-gray-400/10 text-gray-400 ring-gray-400/20'}`}>
                                        {person.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{person.lastSeen}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
