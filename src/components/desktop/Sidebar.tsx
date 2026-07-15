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
import { Loader2, Key } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { clearStorage } from '@/lib/secure-storage';

const Sidebar = () => {
  const router = useRouter();
  const { apiKey, modelName, setNodes, setEdges, nodes, setNodes: updateNodes, setApiKey, setModelName } = useStore();
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
          type: 'default',
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        });
      });

      // Dynamically import layout logic to avoid build issues with dagre
      const { default: getLayoutedElements } = await import('@/components/canvas/useAutoLayout');
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      toast({ title: "Success", description: "Mind map generated!" });
    } catch (error: any) {
      console.error(error);
      const errMsg = error?.message || String(error);
      let description = "Failed to generate mind map.";
      
      if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('limit')) {
        description = "API Rate Limit/Quota Exceeded. Please check your Google AI Studio billing details or wait a minute before retrying.";
      } else if (errMsg.toLowerCase().includes('key') || errMsg.toLowerCase().includes('unauthorized') || errMsg.toLowerCase().includes('api_key')) {
        description = "Invalid API Key. Please log in again with a valid Gemini API Key.";
      } else if (error instanceof Error) {
        description = error.message;
      }
      
      toast({ title: "Generation Failed", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeKey = async () => {
    await clearStorage();
    setApiKey(null);
    setModelName('');
    toast({ title: "Disconnected", description: "API key removed from local storage." });
    router.replace('/auth');
  };

  // Smart Keyword Detector
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!nodes || !nodes.length) return;

      const normalizedText = practiceText.toLowerCase();

      /**
       * Smart match: checks if a keyword is found in the user's text using:
       * 1. Exact word-boundary match (e.g. "ETL" matches "ETL pipeline" but not "ETLs")
       * 2. Mutual stem match: if keyword starts with user-word or user-word starts with keyword
       *    (e.g. "transaction" matches "transactional", "normalize" matches "normalization")
       */
      const isKeywordMatched = (keyword: string, text: string): boolean => {
        const kLower = keyword.toLowerCase().trim();
        if (!kLower) return false;

        // 1. Word-boundary regex match for the full keyword phrase
        const escaped = kLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundaryRegex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
        if (boundaryRegex.test(text)) return true;

        // 2. Stem matching: split keyword into words and check each
        const keywordWords = kLower.split(/\s+/).filter(Boolean);
        const textWords = text.split(/\s+/).filter(Boolean);

        return keywordWords.every((kWord) =>
          textWords.some(
            (tWord) =>
              tWord.startsWith(kWord.slice(0, Math.max(4, kWord.length - 2))) ||
              kWord.startsWith(tWord.slice(0, Math.max(4, tWord.length - 2)))
          )
        );
      };

      const updatedNodes = nodes.map((node) => {
        const keywords = (node.data.keywords as string[]) || [];
        const matchedKeywords: string[] = [];
        const missedKeywords: string[] = [];

        keywords.forEach((k) => {
          if (isKeywordMatched(k, normalizedText)) {
            matchedKeywords.push(k);
          } else {
            missedKeywords.push(k);
          }
        });

        const isMatch = matchedKeywords.length > 0;

        return {
          ...node,
          data: {
            ...node.data,
            highlight: isMatch,
            matchedKeywords,
            missedKeywords,
          },
        };
      });

      const hasChanges = updatedNodes.some(
        (node, i) =>
          node.data.highlight !== nodes[i].data.highlight ||
          JSON.stringify(node.data.matchedKeywords) !== JSON.stringify(nodes[i].data.matchedKeywords)
      );
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

      <div className="space-y-2 flex-1 flex flex-col min-h-[200px]">
        <Label>Practice Box</Label>
        <Textarea 
          placeholder="Type your answer here to check for keywords..." 
          className="flex-1 min-h-[120px] resize-none"
          value={practiceText}
          onChange={(e) => setPracticeText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Keywords will light up green in the map as you type them.
        </p>
      </div>

      {/* Footer / Settings Section */}
      <div className="pt-4 border-t border-stone-200 mt-auto flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Active Model:</span>
          <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">{modelName || 'None'}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleChangeKey}
          className="w-full flex items-center justify-center gap-2 text-stone-600 hover:text-stone-900"
        >
          <Key className="w-3.5 h-3.5" />
          Change API Key
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
