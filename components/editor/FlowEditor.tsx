"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    Connection,
    Edge,
    Node,
    addEdge,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TriggerNode } from "./nodes/TriggerNode";
import { MessageNode } from "./nodes/MessageNode";
import { ActionNode } from "./nodes/ActionNode";
import { MediaNode } from "./nodes/MediaNode";
import { CollectionNode } from "./nodes/CollectionNode";
import { DelayNode } from "./nodes/DelayNode";

import { EditorSidebar } from "./EditorSidebar";
import { PropertiesPanel } from "./PropertiesPanel";

const nodeTypes = {
    trigger: TriggerNode,
    message: MessageNode,
    action: ActionNode,
    media: MediaNode,
    collection: CollectionNode,
    delay: DelayNode,
};

function FlowEditorInner() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [clipboard, setClipboard] = useState<Node | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const onAddNode = useCallback((type: string) => {
        const id = `${type}-${Date.now()}`;
        const newNode: Node = {
            id,
            type,
            position: { x: 100, y: 100 },
            data: { trigger: "", text: "", url: "", variable: "", timeout: 60, delay: 3, showTyping: false },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes]);

    const onUpdateNode = useCallback((id: string, data: any) => {
        setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data } : node)));
    }, [setNodes]);

    const onDeleteNode = useCallback((id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        setSelectedNodeId(null);
    }, [setNodes, setEdges]);

    // Keyboard Shortcuts (Copy, Paste, Duplicate)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "c" && selectedNodeId) {
                const node = nodes.find((n) => n.id === selectedNodeId);
                if (node) setClipboard({ ...node });
            }
            if (e.ctrlKey && e.key === "v" && clipboard) {
                const id = `${clipboard.type}-${Date.now()}`;
                const newNode: Node = {
                    ...clipboard,
                    id,
                    position: { x: clipboard.position.x + 50, y: clipboard.position.y + 50 }
                };
                setNodes((nds) => nds.concat(newNode));
            }
            if (e.ctrlKey && e.key === "d" && selectedNodeId) {
                const node = nodes.find((n) => n.id === selectedNodeId);
                if (node) {
                    const id = `${node.type}-${Date.now()}`;
                    const newNode: Node = {
                        ...node,
                        id,
                        position: { x: node.position.x + 50, y: node.position.y + 50 }
                    };
                    setNodes((nds) => nds.concat(newNode));
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedNodeId, clipboard, nodes, setNodes]);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    return (
        <div className="flex-1 flex overflow-hidden">
            <EditorSidebar onAddNode={onAddNode} />

            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                    onPaneClick={() => setSelectedNodeId(null)}
                    fitView
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls />
                </ReactFlow>
            </div>

            <PropertiesPanel
                selectedNode={selectedNode}
                onUpdate={onUpdateNode}
                onDelete={onDeleteNode}
                onClose={() => setSelectedNodeId(null)}
            />
        </div>
    );
}

export function FlowEditor() {
    return (
        <div className="flex-1 h-full flex flex-col">
            <ReactFlowProvider>
                <FlowEditorInner />
            </ReactFlowProvider>
        </div>
    );
}
