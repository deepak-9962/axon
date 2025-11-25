'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { downloadGraphAsPng, generateMarkdownFromGraph } from '@/lib/export-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Image as ImageIcon, FileText, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ExportMenuProps {
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

const ExportMenu = ({ viewportRef }: ExportMenuProps) => {
  const { nodes, edges } = useStore();
  const { toast } = useToast();

  const handleDownloadImage = async () => {
    try {
      await downloadGraphAsPng(viewportRef);
      toast({ title: "Success", description: "Image downloaded successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download image.", variant: "destructive" });
    }
  };

  const handleCopyNotes = async () => {
    try {
      const markdown = generateMarkdownFromGraph(nodes, edges);
      await navigator.clipboard.writeText(markdown);
      toast({ title: "Success", description: "Study notes copied to clipboard!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy notes.", variant: "destructive" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleDownloadImage} className="cursor-pointer">
          <ImageIcon className="mr-2 h-4 w-4" />
          <span>Save Image (PNG)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyNotes} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Study Notes</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;
