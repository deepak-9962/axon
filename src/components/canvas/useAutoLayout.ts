// @ts-ignore
import dagre from '@/lib/dagre';
import { Node, Edge } from '@xyflow/react';

const nodeWidth = 265; // Matches the 250px card width + horizontal padding

export const getNodeHeight = (node: Node): number => {
  if (node.type === 'custom') {
    return 70;
  }
  
  if (node.type === 'richNode') {
    const expanded = !!node.data?.expanded;
    if (!expanded) {
      return 60; // Sleek collapsed height
    }
    
    // Calculate expanded height dynamically
    const detailsCount = (node.data.details as string[] | undefined)?.length || 0;
    const matchedKeywords = (node.data.matchedKeywords as string[] | undefined) ?? [];
    const missedKeywords = (node.data.missedKeywords as string[] | undefined) ?? [];
    const totalKeywords = matchedKeywords.length + missedKeywords.length;
    
    let height = 55; // Header height
    
    // Keyword badges section height
    if (totalKeywords > 0) {
      const keywordLines = Math.max(1, Math.ceil(totalKeywords / 3));
      height += 24 + keywordLines * 26;
    }
    
    // Details height
    if (detailsCount > 0) {
      height += detailsCount * 22;
    }
    
    // Exam tip height
    if (node.data.exam_tip) {
      height += 65;
    }
    
    height += 24; // Padding
    return Math.max(100, height);
  }
  
  return 80; // default fallback
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: 'LR',
    nodesep: 90,   // Vertical separation between nodes
    ranksep: 160,  // Horizontal separation between columns/ranks
  });

  nodes.forEach((node) => {
    const height = getNodeHeight(node);
    dagreGraph.setNode(node.id, { width: nodeWidth, height: height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const height = getNodeHeight(node);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default getLayoutedElements;
