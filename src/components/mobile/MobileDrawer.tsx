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
import { Loader2, Plus } from 'lucide-react';
import { Node } from '@xyflow/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MobileDrawer = () => {
  const { apiKey, modelName, setNodes, setEdges, nodes, setNodes: updateNodes } = useStore();
  const [question, setQuestion] = useState('');
  const [marks, setMarks] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [practiceText, setPracticeText] = useState('');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

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
      
      const newNodes: Node[] = [];
      const newEdges: any[] = [];

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

      // Dynamically import layout logic
      const { default: getLayoutedElements } = await import('@/components/canvas/useAutoLayout');
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      toast({ title: "Success", description: "Mind map generated!" });
      setOpen(false); // Close drawer on success
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate mind map.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!nodes || !nodes.length) return;

      const normalizedText = practiceText.toLowerCase();
      const updatedNodes = nodes.map((node) => {
        const keywords = (node.data.keywords as string[]) || [];
        const isMatch = keywords.some((k) => normalizedText.includes(k.toLowerCase()));
        
        return {
          ...node,
          data: {
            ...node.data,
            highlight: isMatch,
          },
        };
      });

      const hasChanges = updatedNodes.some((node, i) => node.data.highlight !== nodes[i].data.highlight);
      if (hasChanges) {
        updateNodes(updatedNodes);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [practiceText, nodes, updateNodes]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Answer Architect</SheetTitle>
          <SheetDescription>
            Create your answer skeleton.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 mt-6 flex-1 overflow-y-auto">
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
              placeholder="Type your answer here..." 
              className="h-full min-h-[150px] resize-none"
              value={practiceText}
              onChange={(e) => setPracticeText(e.target.value)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileDrawer;
