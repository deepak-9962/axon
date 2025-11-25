import { toPng } from 'html-to-image';
import { Node, Edge } from '@xyflow/react';

export const downloadGraphAsPng = async (viewportRef: React.RefObject<HTMLDivElement | null>) => {
  if (!viewportRef.current) return;

  try {
    // Filter out UI controls and the export menu itself
    const filter = (node: HTMLElement) => {
      if (!node.classList) return true;
      return !node.classList.contains('react-flow__controls') && 
             !node.classList.contains('react-flow__panel');
    };

    const dataUrl = await toPng(viewportRef.current, {
      backgroundColor: '#fafaf9',
      pixelRatio: 2,
      cacheBust: true,
      filter,
      width: viewportRef.current.offsetWidth,
      height: viewportRef.current.offsetHeight,
      style: {
        width: `${viewportRef.current.offsetWidth}px`,
        height: `${viewportRef.current.offsetHeight}px`,
      },
    });

    const link = document.createElement('a');
    link.download = 'answer-architect-map.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to download image:', err);
    throw err;
  }
};

export const generateMarkdownFromGraph = (nodes: Node[], edges: Edge[]): string => {
  if (!nodes.length) return '';

  // Helper to find children of a node
  const getChildren = (nodeId: string) => {
    return edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => nodes.find((n) => n.id === edge.target))
      .filter((n): n is Node => !!n);
  };

  // Find root node (usually 'root' or node with no incoming edges)
  const rootNode = nodes.find((n) => n.id === 'root') || 
                   nodes.find((n) => !edges.some((e) => e.target === n.id));

  if (!rootNode) return 'No root node found.';

  let markdown = `# ${rootNode.data.label}\n\n`;

  const traverse = (node: Node, depth: number) => {
    const children = getChildren(node.id);
    
    children.forEach((child) => {
      const indent = '  '.repeat(depth);
      const label = child.data.label;
      const keywords = (child.data.keywords as string[]) || [];
      const keywordText = keywords.length ? ` (Keywords: ${keywords.join(', ')})` : '';
      
      markdown += `${indent}- ${label}${keywordText}\n`;
      
      traverse(child, depth + 1);
    });
  };

  traverse(rootNode, 0);

  return markdown;
};
