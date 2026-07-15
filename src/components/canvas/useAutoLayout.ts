// @ts-ignore
import dagre from '@/lib/dagre';
import { Node, Edge } from '@xyflow/react';

const nodeWidth = 265; // Matches the 250px card width + horizontal padding
const nodeHeight = 100; // Matches average card height + vertical spacing

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: 'LR',
    nodesep: 90,   // Vertical separation between nodes
    ranksep: 160,  // Horizontal separation between columns/ranks
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default getLayoutedElements;
