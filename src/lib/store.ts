import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, OnNodesChange, OnEdgesChange } from '@xyflow/react';

interface AppState {
  apiKey: string | null;
  modelName: string;
  nodes: Node[];
  edges: Edge[];
  userAnswer: string;
  setApiKey: (key: string | null) => void;
  setModelName: (model: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setUserAnswer: (answer: string) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
}

export const useStore = create<AppState>((set, get) => ({
  apiKey: null,
  modelName: 'gemini-1.5-flash',
  nodes: [],
  edges: [],
  userAnswer: '',
  setApiKey: (key) => set({ apiKey: key }),
  setModelName: (model) => set({ modelName: model }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setUserAnswer: (answer) => set({ userAnswer: answer }),
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
}));
