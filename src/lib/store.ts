import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange } from '@xyflow/react';
import getLayoutedElements from '@/components/canvas/useAutoLayout';

interface AppState {
  apiKey: string | null;
  modelName: string;
  nodes: Node[];
  edges: Edge[];
  userAnswer: string;
  question: string;
  marks: number;
  setApiKey: (key: string | null) => void;
  setModelName: (model: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setUserAnswer: (answer: string) => void;
  setQuestion: (question: string) => void;
  setMarks: (marks: number) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  toggleNodeExpanded: (nodeId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  apiKey: null,
  modelName: 'gemini-1.5-flash',
  nodes: [],
  edges: [],
  userAnswer: '',
  question: '',
  marks: 5,
  setApiKey: (key) => set({ apiKey: key }),
  setModelName: (model) => set({ modelName: model }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setUserAnswer: (answer) => set({ userAnswer: answer }),
  setQuestion: (question) => {
    set({ question });
    if (typeof window !== 'undefined') {
      localStorage.setItem('AXON_QUESTION', question);
    }
  },
  setMarks: (marks) => {
    set({ marks });
    if (typeof window !== 'undefined') {
      localStorage.setItem('AXON_MARKS', marks.toString());
    }
  },
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  toggleNodeExpanded: (nodeId) => {
    const { nodes, edges } = get();
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            expanded: !node.data.expanded,
          },
        };
      }
      return node;
    });

    const { nodes: layoutedNodes } = getLayoutedElements(updatedNodes, edges);
    set({ nodes: layoutedNodes });
  },
}));
