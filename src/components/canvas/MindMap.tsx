'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, Node, Edge, Connection, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import RichNode from './RichNode';
import getLayoutedElements from './useAutoLayout';
import { useStore } from '@/lib/store';
import ExportMenu from './ExportMenu';

const nodeTypes = {
  custom: CustomNode,
  richNode: RichNode,
};

const MindMap = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges } = useStore();
  const viewportRef = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges(addEdge(params, edges)),
    [edges, setEdges],
  );

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  // Auto-layout when nodes change significantly (optional, or triggered manually)
  // For now, we'll rely on the initial generation or manual trigger if needed.
  // But the PRD says "Pass 2: Run useAutoLayout". This usually happens after generation.

  return (
    <div className="w-full h-full touch-none" ref={viewportRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-stone-50"
      >
        <Controls />
        <Background />
        <Panel position="top-right">
          <ExportMenu viewportRef={viewportRef} />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default MindMap;
