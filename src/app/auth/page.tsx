'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveApiKey, saveModelName } from '@/lib/secure-storage';
import { validateApiKey } from '@/lib/gemini';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Key } from 'lucide-react';

export default function AuthPage() {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setApiKey, setModelName } = useStore();
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!keyInput.trim()) {
      toast({ title: "Error", description: "Please enter an API Key", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const validModel = await validateApiKey(keyInput);
      if (validModel) {
        await saveApiKey(keyInput);
        await saveModelName(validModel);
        setApiKey(keyInput);
        setModelName(validModel);
        toast({ title: "Success", description: `Connected using ${validModel}!` });
        router.replace('/studio');
      } else {
        toast({ title: "Error", description: "Invalid API Key or no compatible model found.", variant: "destructive" });
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Enter API Key
          </CardTitle>
          <CardDescription>
            The Answer Architect requires a Google Gemini API Key. Your key is stored locally on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input 
              type="password" 
              placeholder="Paste your Gemini API Key here" 
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleConnect} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                Get API Key
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
