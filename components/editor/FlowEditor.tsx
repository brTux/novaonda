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
import { InputNode } from "./nodes/InputNode";

import { EditorSidebar } from "./EditorSidebar";
import { PropertiesPanel } from "./PropertiesPanel";
import { saveFlow } from "@/app/actions/flows";
import { Loader2, Save } from "lucide-react";

const nodeTypes = {
    TRIGGER: TriggerNode,
    MESSAGE: MessageNode,
    ACTION: ActionNode,
    IMAGE: MediaNode,
    VIDEO: MediaNode,
    AUDIO: MediaNode,
    COLLECTION: CollectionNode,
    DELAY: DelayNode,
    INPUT: InputNode,
};

interface FlowEditorProps {
    initialData?: {
        id: string;
        nodes: any[];
        edges: any[];
    };
}

function FlowEditorInner({ initialData }: FlowEditorProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialData?.nodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialData?.edges || []);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [clipboard, setClipboard] = useState<Node | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { screenToFlowPosition } = useReactFlow();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        [setEdges]
    );

    const onAddNode = useCallback((type: string, data: any = {}) => {
        const id = `${type}-${Date.now()}`;
        const newNode: Node = {
            id,
            type,
            position: { x: 100, y: 100 },
            data: {
                trigger: "",
                text: "Novo Bloco",
                url: "",
                variable: "",
                timeout: 60,
                delay: 3,
                showTyping: false,
                ...data
            },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(id);
    }, [setNodes]);

    const handleSave = async (status?: "DRAFT" | "PUBLISHED") => {
        if (!initialData?.id) return;
        setIsSaving(true);
        try {
            const result = await saveFlow(initialData.id, nodes, edges, status);

            if (result.error) {
                alert(`Erro: ${result.error}`);
                return;
            }

            if (status === "PUBLISHED") {
                alert("Fluxo publicado com sucesso!");
            } else {
                alert("Rascunho salvo com sucesso!");
            }
        } catch (error) {
            console.error(error);
            alert("Erro fatal ao salvar fluxo");
        } finally {
            setIsSaving(false);
        }
    };

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
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedNodeId, clipboard, nodes, edges, initialData, setNodes]);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    return (
        <div className="flex-1 flex overflow-hidden relative">
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
                    minZoom={0.05}
                    maxZoom={2}
                >
                    <Background color="#cbd5e1" gap={20} />
                    <Controls />
                </ReactFlow>

                {/* Floating Save/Publish Buttons */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => handleSave("DRAFT")}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm items-center justify-center min-w-[100px]"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? "Salvando..." : "Salvar Rascunho"}
                    </button>
                    <button
                        onClick={() => handleSave("PUBLISHED")}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ff5100] text-white rounded-lg font-bold text-xs hover:bg-[#e64a00] transition-all shadow-lg items-center justify-center min-w-[100px]"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? "Publicando..." : "Publicar Fluxo"}
                    </button>
                </div>
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

export function FlowEditor({ initialData }: FlowEditorProps) {
    return (
        <div className="flex-1 h-full flex flex-col">
            <ReactFlowProvider>
                <FlowEditorInner initialData={initialData} />
            </ReactFlowProvider>
        </div>
    );
}
