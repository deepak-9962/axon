'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { generateMindMap } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Node } from '@xyflow/react';

const Sidebar = () => {
  const { apiKey, modelName, setNodes, setEdges, nodes, setNodes: updateNodes } = useStore();
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [practiceText, setPracticeText] = useState('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({ title: "Error", description: "API Key not found. Please login again.", variant: "destructive" });
      return;
    }
    if (!question.trim()) {
      toast({ title: "Error", description: "Please enter a question.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const aiResponse = await generateMindMap(question, marks[0], apiKey, modelName);
      
      // Convert AI Response to React Flow Nodes/Edges
      const newNodes: Node[] = [];
      const newEdges: any[] = [];

      // Root Node
      newNodes.push({
        id: 'root',
        type: 'richNode',
        data: { 
          label: aiResponse.root_node.label, 
          note: aiResponse.root_node.note, 
          highlight: false 
        },
        position: { x: 0, y: 0 },
      });

      // Branches
      aiResponse.branches.forEach((branch) => {
        newNodes.push({
          id: branch.id,
          type: 'richNode',
          data: { 
            label: branch.label, 
            keywords: branch.keywords,
            details: branch.details,
            exam_tip: branch.exam_tip,
            highlight: false 
          },
          position: { x: 0, y: 0 },
        });

        newEdges.push({
          id: `e-${branch.parent_id}-${branch.id}`,
          source: branch.parent_id === 'root' ? 'root' : branch.parent_id,
          target: branch.id,
          type: 'smoothstep',
        });
      });

      // Dynamically import layout logic to avoid build issues with dagre
      const { default: getLayoutedElements } = await import('@/components/canvas/useAutoLayout');
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      toast({ title: "Success", description: "Mind map generated!" });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate mind map.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Missing Keyword Detector
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!nodes || !nodes.length) return;

      const normalizedText = practiceText.toLowerCase();
      const updatedNodes = nodes.map((node) => {
        const keywords = (node.data.keywords as string[]) || [];
        const isMatch = keywords.some((k) => normalizedText.includes(k.toLowerCase()));
        
        // Only update if changed to avoid infinite loops if we were using setNodes directly in a way that triggers this effect
        // But here we are mapping.
        return {
          ...node,
          data: {
            ...node.data,
            highlight: isMatch,
          },
        };
      });

      // Check if there's actually a change to avoid unnecessary re-renders
      const hasChanges = updatedNodes.some((node, i) => node.data.highlight !== nodes[i].data.highlight);
      if (hasChanges) {
        updateNodes(updatedNodes);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [practiceText, nodes, updateNodes]);

  return (
    <div className="w-[350px] h-full border-r bg-white p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Answer Architect</h2>
        <p className="text-sm text-muted-foreground">Structure your exam answers.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Input 
            placeholder="Enter exam question..." 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Marks</Label>
            <span className="text-sm text-muted-foreground">{marks[0]}</span>
          </div>
          <Slider 
            value={marks} 
            onValueChange={setMarks} 
            min={2} 
            max={15} 
            step={1} 
          />
        </div>

        <Button className="w-full" onClick={handleGenerate} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Skeleton
        </Button>
      </div>

      <div className="space-y-2 flex-1">
        <Label>Practice Box</Label>
        <Textarea 
          placeholder="Type your answer here to check for keywords..." 
          className="h-full min-h-[200px] resize-none"
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Keywords will light up green in the map as you type them.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
