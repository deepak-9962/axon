// @ts-ignore
import dagre from '@/lib/dagre';
import { Node, Edge } from '@xyflow/react';

const nodeWidth = 265; // Matches the 250px card width + horizontal padding

export const getNodeHeight = (node: Node): number => {
  if (node.type === 'custom') {
    return 80;
  }
  
  if (node.type === 'richNode') {
    const expanded = !!node.data?.expanded;
    if (!expanded) {
      return 70; // Sleek collapsed height with safety padding
    }
    
    // Calculate expanded height dynamically with a generous safety margin for text wrapping
    const detailsCount = (node.data.details as string[] | undefined)?.length || 0;
    const matchedKeywords = (node.data.matchedKeywords as string[] | undefined) ?? [];
    const missedKeywords = (node.data.missedKeywords as string[] | undefined) ?? [];
    const totalKeywords = matchedKeywords.length + missedKeywords.length;
    
    let height = 90; // Larger base height for header & title wrapping
    
    // Keyword badges section height (assuming 2 badges per row to account for wrapping)
    if (totalKeywords > 0) {
      const keywordLines = Math.max(1, Math.ceil(totalKeywords / 2));
      height += 35 + keywordLines * 28;
    }
    
    // Details list height (each detail bullet can wrap to 2 lines)
    if (detailsCount > 0) {
      height += detailsCount * 30; // 30px per detail allows for wrapping
    }
    
    // Exam tip box height (tip text usually wraps to 2-3 lines)
    if (node.data.exam_tip) {
      height += 90;
    }
    
    height += 40; // Additional safety margin cushion
    return Math.max(150, height);
  }
  
  return 100; // default fallback
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: 'LR',
    nodesep: 130,  // Generous vertical separation between nodes
    ranksep: 200,  // Generous horizontal separation between columns/ranks
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
