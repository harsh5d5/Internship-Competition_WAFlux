"use client";

import { useState, useCallback } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ArrowLeft, Save, Play, Plus, MessageSquare, Clock, FileText } from "lucide-react";
import Link from 'next/link';

// Custom Node Styling
const nodeStyle = {
    background: '#1f2c34',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px',
    minWidth: '150px',
    fontSize: '12px',
};

// Initial Nodes
const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start: User says "Price"' },
        position: { x: 250, y: 0 },
        style: { ...nodeStyle, background: '#02C173', color: '#000', fontWeight: 'bold' }
    },
    {
        id: '2',
        data: { label: 'Send: Menu PDF 📄' },
        position: { x: 250, y: 150 },
        style: nodeStyle
    },
    {
        id: '3',
        data: { label: 'Wait: 5 Minutes ⏳' },
        position: { x: 250, y: 300 },
        style: { ...nodeStyle, border: '1px dashed #02C173' }
    },
    {
        id: '4',
        data: { label: 'Send: "Did you see it?"' },
        position: { x: 250, y: 450 },
        style: nodeStyle
    },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#02C173' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#02C173' } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#02C173' } },
];

export default function AutomationPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection | Edge) => {
        setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#02C173' } }, eds));
    }, [setEdges]);

    // Function to add new nodes dynamically (Mock logic)
    const addNode = (type: string) => {
        const id = (nodes.length + 1).toString();
        const newNode = {
            id,
            data: { label: `${type} Node` },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            style: nodeStyle,
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="h-screen bg-[#060707] flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111b21] z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#02C173]"></span>
                            Welcome Flow
                        </h1>
                        <p className="text-xs text-gray-500">Last edited just now</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 rounded-lg border border-white/5 transition-colors">
                        <Save size={16} /> Save Draft
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-black bg-[#02C173] hover:bg-[#02a965] rounded-lg shadow-[0_0_15px_rgba(2,193,115,0.2)] transition-colors">
                        <Play size={16} /> Publish Flow
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Toolbar */}
                <div className="w-64 border-r border-white/10 bg-[#0b141a] p-4 space-y-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Components</h3>

                    <div
                        className="p-3 bg-[#1f2c34] border border-white/5 rounded-lg cursor-grab hover:border-[#02C173]/50 transition-colors flex items-center gap-3 group"
                        onClick={() => addNode('Message')}
                    >
                        <div className="p-2 bg-blue-500/20 text-blue-500 rounded-md"><MessageSquare size={16} /></div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Send Message</span>
                    </div>

                    <div
                        className="p-3 bg-[#1f2c34] border border-white/5 rounded-lg cursor-grab hover:border-[#02C173]/50 transition-colors flex items-center gap-3 group"
                        onClick={() => addNode('Delay')}
                    >
                        <div className="p-2 bg-purple-500/20 text-purple-500 rounded-md"><Clock size={16} /></div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Time Delay</span>
                    </div>

                    <div
                        className="p-3 bg-[#1f2c34] border border-white/5 rounded-lg cursor-grab hover:border-[#02C173]/50 transition-colors flex items-center gap-3 group"
                        onClick={() => addNode('Media')}
                    >
                        <div className="p-2 bg-orange-500/20 text-orange-500 rounded-md"><FileText size={16} /></div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Send Document</span>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 h-full bg-[#060707] relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
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
