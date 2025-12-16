"use client";

import { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Play, Plus, MessageSquare, Clock, FileText, Image as ImageIcon, StickyNote } from "lucide-react";
import Link from 'next/link';

// --- Custom Nodes ---

const NoteNode = ({ data }: any) => {
    return (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700/50 shadow-sm hover:shadow-xl rounded-xl min-w-[200px] max-w-[300px] p-4 transition-all group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 opacity-60">
                    <StickyNote size={14} className="text-yellow-700 dark:text-yellow-500" />
                    <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-wider">Note</span>
                </div>
            </div>
            <textarea
                className="w-full bg-transparent text-sm font-medium text-yellow-900 dark:text-yellow-100 focus:outline-none resize-none h-[120px] leading-relaxed placeholder-yellow-700/30 dark:placeholder-yellow-500/30"
                placeholder="Write something..."
                defaultValue={data.label}
            />
        </div>
    );
};

const MessageNode = ({ data }: any) => {
    return (
        <div className="bg-white dark:bg-[#1f2c34] border-2 border-transparent hover:border-blue-500/50 shadow-lg rounded-xl min-w-[250px] overflow-hidden transition-all group">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-[#1f2c34]" />
            <div className="bg-blue-500/10 dark:bg-blue-500/20 p-3 flex items-center gap-2 border-b border-blue-100 dark:border-white/5">
                <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide">Send Message</span>
            </div>
            <div className="p-3">
                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Message Content</label>
                <textarea
                    className="w-full bg-gray-50 dark:bg-[#111b21] text-sm text-gray-900 dark:text-gray-100 p-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-[80px]"
                    placeholder="Hello! How can I help you today?"
                    defaultValue={data.label}
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-[#1f2c34]" />
        </div>
    );
};

const DelayNode = ({ data }: any) => {
    return (
        <div className="bg-white dark:bg-[#1f2c34] border-2 border-transparent hover:border-purple-500/50 shadow-lg rounded-xl min-w-[200px] overflow-hidden transition-all">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white dark:!border-[#1f2c34]" />
            <div className="bg-purple-500/10 dark:bg-purple-500/20 p-3 flex items-center gap-2 border-b border-purple-100 dark:border-white/5">
                <Clock size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wide">Time Delay</span>
            </div>
            <div className="p-3 flex gap-2">
                <input
                    type="number"
                    className="w-20 bg-gray-50 dark:bg-[#111b21] text-sm text-center font-bold text-gray-900 dark:text-gray-100 p-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    defaultValue={data.value || 5}
                />
                <select className="flex-1 bg-gray-50 dark:bg-[#111b21] text-sm text-gray-900 dark:text-gray-100 p-2 rounded-lg border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option>Minutes</option>
                    <option>Hours</option>
                    <option>Days</option>
                </select>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white dark:!border-[#1f2c34]" />
        </div>
    );
};

const AttachmentNode = ({ data }: any) => {
    return (
        <div className="bg-white dark:bg-[#1f2c34] border-2 border-transparent hover:border-orange-500/50 shadow-lg rounded-xl min-w-[250px] overflow-hidden transition-all">
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white dark:!border-[#1f2c34]" />
            <div className="bg-orange-500/10 dark:bg-orange-500/20 p-3 flex items-center gap-2 border-b border-orange-100 dark:border-white/5">
                <ImageIcon size={16} className="text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-bold text-orange-900 dark:text-orange-100 uppercase tracking-wide">Attachment</span>
            </div>
            <div className="p-3">
                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">File URL / Source</label>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111b21] p-2 rounded-lg border border-gray-200 dark:border-white/10">
                    <div className="w-8 h-8 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center text-gray-400">
                        <FileText size={14} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 focus:outline-none truncate"
                        placeholder="https://example.com/menu.pdf"
                        defaultValue={data.label}
                    />
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white dark:!border-[#1f2c34]" />
        </div>
    );
};

const initialNodes = [
    {
        id: '1',
        type: 'messageNode',
        data: { label: 'Start: User says "Price"' },
        position: { x: 250, y: 0 },
    },
    {
        id: '2',
        type: 'attachmentNode',
        data: { label: 'https://waflux.com/menu.pdf' },
        position: { x: 250, y: 200 },
    },
    {
        id: '3',
        type: 'delayNode',
        data: { value: 10 },
        position: { x: 250, y: 400 },
    },
    {
        id: '4',
        type: 'noteNode',
        data: { label: 'Remember to update the pricing PDF next month!' },
        position: { x: 550, y: 100 },
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#02C173' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#02C173' } },
];

export default function AutomationPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({
        messageNode: MessageNode,
        delayNode: DelayNode,
        attachmentNode: AttachmentNode,
        noteNode: NoteNode,
    }), []);

    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#02C173' } }, eds));
    }, [setEdges]);

    // Function to add new nodes dynamically
    const addNode = (type: string) => {
        const id = (nodes.length + 1).toString();
        let newNode: any = {
            id,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
        };

        if (type === 'Message') {
            newNode.type = 'messageNode';
            newNode.data = { label: 'New Message...' };
        } else if (type === 'Delay') {
            newNode.type = 'delayNode';
            newNode.data = { value: 5 };
        } else if (type === 'Media') {
            newNode.type = 'attachmentNode';
            newNode.data = { label: '' };
        } else if (type === 'Note') {
            newNode.type = 'noteNode';
            newNode.data = { label: '' };
        }

        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="h-screen bg-white dark:bg-[#060707] flex flex-col transition-colors">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-[#111b21] z-10 transition-colors shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#02C173] animate-pulse"></span>
                            Welcome Flow
                            <span className="px-2 py-0.5 rounded text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 font-bold uppercase tracking-wider border border-yellow-500/20">Draft</span>
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                            Last edited just now • V1.0
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/5 transition-all">
                        <Save size={16} /> Save Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#02C173] hover:bg-[#02a965] rounded-lg shadow-[0_0_15px_rgba(2,193,115,0.4)] hover:shadow-[0_0_25px_rgba(2,193,115,0.6)] transition-all transform hover:-translate-y-0.5">
                        <Play size={16} /> Publish Flow
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Toolbar */}
                <div className="w-72 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b141a] p-5 space-y-6 transition-colors z-10 shadow-xl">
                    <div>
                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Plus size={12} className="text-[#02C173]" /> Toolbox
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Click or drag elements to the canvas to build your automation flow.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div
                            className="p-3 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/5 rounded-xl cursor-grab hover:border-[#02C173] hover:shadow-lg dark:hover:shadow-[#02C173]/10 transition-all flex items-center gap-3 group transform hover:scale-[1.02]"
                            onClick={() => addNode('Message')}
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Send Message</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Text, Buttons, Lists</span>
                            </div>
                        </div>

                        <div
                            className="p-3 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/5 rounded-xl cursor-grab hover:border-[#02C173] hover:shadow-lg dark:hover:shadow-[#02C173]/10 transition-all flex items-center gap-3 group transform hover:scale-[1.02]"
                            onClick={() => addNode('Delay')}
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-500 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Clock size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Time Delay</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Wait for minutes/hours</span>
                            </div>
                        </div>

                        <div
                            className="p-3 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/5 rounded-xl cursor-grab hover:border-[#02C173] hover:shadow-lg dark:hover:shadow-[#02C173]/10 transition-all flex items-center gap-3 group transform hover:scale-[1.02]"
                            onClick={() => addNode('Media')}
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <FileText size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Attachments</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">PDFs, Images, Videos</span>
                            </div>
                        </div>

                        <div
                            className="p-3 bg-white dark:bg-[#1f2c34] border border-gray-200 dark:border-white/5 rounded-xl cursor-grab hover:border-[#02C173] hover:shadow-lg dark:hover:shadow-[#02C173]/10 transition-all flex items-center gap-3 group transform hover:scale-[1.02]"
                            onClick={() => addNode('Note')}
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 rounded-lg group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <StickyNote size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Sticky Note</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">Add comments & annotations</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 h-full bg-gray-100 dark:bg-[#060707] relative transition-colors">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background color="#222" gap={16} />
                        <Controls className="bg-[#1f2c34] border-white/10 text-white fill-white" />
                        <MiniMap
                            nodeColor={() => '#02C173'}
                            maskColor="rgba(0,0,0,0.7)"
                            className="bg-[#1f2c34] border border-white/10 rounded-lg"
                        />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
