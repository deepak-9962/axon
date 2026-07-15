'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiKey, getModelName } from '@/lib/secure-storage';
import { useStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { setApiKey, setModelName } = useStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        const key = envKey || await getApiKey();
        const model = await getModelName();
        
        if (key) {
          setApiKey(key);
          if (model) setModelName(model);
          
          // Load question and marks
          if (typeof window !== 'undefined') {
            const savedQuestion = localStorage.getItem('AXON_QUESTION');
            const savedMarks = localStorage.getItem('AXON_MARKS');
            if (savedQuestion) useStore.getState().setQuestion(savedQuestion);
            if (savedMarks) useStore.getState().setMarks(parseInt(savedMarks, 10));
          }
          
          router.replace('/studio');
        } else {
          router.replace('/auth');
        }
      } catch (error) {
        console.error("Auth check failed", error);
        router.replace('/auth');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router, setApiKey, setModelName]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
