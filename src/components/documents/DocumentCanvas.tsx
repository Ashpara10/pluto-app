"use client";
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type NodeChange, type EdgeChange, type Connection, type Node, type NodeProps, Background, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TGetDocument } from '@/lib/types';
import DocumentCardItem from './DocumentCard';
import { Document } from '@/lib/db/schema';
import { useQueryState } from 'nuqs';

const DocumentNode = ({ data }: NodeProps<Node<{ document: Document; isFavorite: boolean }>>) => {
    return (
        <div className="w-[300px]">
            <DocumentCardItem
                document={data.document}
                isFavourite={data.isFavorite}
                handleCheckChange={() => { }}
            />
        </div>
    );
};

export type DocumentCanvasProps = {
    documents: TGetDocument[]
    isLoading: boolean
};

export default function DocumentCanvas({ documents, isLoading }: DocumentCanvasProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [documentId, setDocumentId] = useQueryState('documentId');

    useEffect(() => {
        if (documents) {
            const newNodes: Node[] = documents.map((doc, index) => {
                const col = index % 4;
                const row = Math.floor(index / 4);
                return {
                    id: doc.document.id,
                    type: 'document',
                    position: { x: col * 350, y: row * 350 }, // Simple grid layout
                    data: {
                        document: doc.document,
                        isFavorite: doc.isFavorite
                    }
                };
            });
            setNodes(newNodes);
        }
    }, [documents]);

    const nodeTypes = useMemo(() => ({ document: DocumentNode }), []);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setDocumentId(!!documentId ? null : node.id);
    }, [setDocumentId, documentId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading canvas...</div>;
    }

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <ReactFlow

                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
            </ReactFlow>
        </div>
    );
}