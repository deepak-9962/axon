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
        const key = await getApiKey();
        const model = await getModelName();
        
        if (key) {
          setApiKey(key);
          if (model) setModelName(model);
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
  }, [router, setApiKey]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
