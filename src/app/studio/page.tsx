'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/desktop/Sidebar';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { getApiKey, getModelName } from '@/lib/secure-storage';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const MindMap = dynamic(() => import('@/components/canvas/MindMap'), { ssr: false });

export default function StudioPage() {
  const router = useRouter();
  const { setApiKey, setModelName, setQuestion, setMarks } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        const key = await getApiKey();
        const model = await getModelName();
        
        if (key) {
          setApiKey(key);
          if (model) setModelName(model);
          
          // Restore question and marks
          if (typeof window !== 'undefined') {
            const savedQuestion = localStorage.getItem('AXON_QUESTION');
            const savedMarks = localStorage.getItem('AXON_MARKS');
            if (savedQuestion) setQuestion(savedQuestion);
            if (savedMarks) setMarks(parseInt(savedMarks, 10));
          }
        } else {
          router.replace('/auth');
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        router.replace('/auth');
      } finally {
        setLoading(false);
      }
    };
    initializeStore();
  }, [setApiKey, setModelName, setQuestion, setMarks, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative">
        <MindMap />
        
        {/* Mobile Drawer - Visible on Mobile */}
        <div className="md:hidden">
          <MobileDrawer />
        </div>
      </div>
    </div>
  );
}
