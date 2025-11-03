'use client';

import DialForm from '@/components/DialForm';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import { useEffect, useState } from 'react';

export default function DialPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');
        
        if (!session) {
          console.warn('⚠️ No session found, redirecting to login');
          router.push('/login');
          return;
        }
        
        console.log('✅ Authenticated user:', session.user.email);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check exception:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, session]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSuccess = () => {
    // Optionally redirect to history after successful dial
    setTimeout(() => {
      router.push('/history');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-foreground">
            Make a Call
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Enter a phone number and select an AMD strategy to initiate a call.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
          <DialForm onSuccess={handleSuccess} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl p-6">
            <h2 className="mb-4 text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <span className="text-2xl">📱</span> How it works
            </h2>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
              <li>Enter a phone number in E.164 format (e.g., +12345678900)</li>
              <li>Choose an AMD strategy from the dropdown</li>
              <li>Optionally enable "Connect on human" for live calls</li>
              <li>Click "Dial Now" to initiate the call</li>
              <li>Check the History page for call results</li>
            </ol>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/80 backdrop-blur-xl p-6">
            <h2 className="mb-4 text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <span className="text-2xl">⚡</span> AMD Strategies
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex flex-col">
                <strong className="text-foreground">Twilio Native:</strong>
                <span className="text-muted-foreground">Fast detection (~1-2s, 70-90% accuracy)</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-foreground">Media Streams:</strong>
                <span className="text-muted-foreground">Real-time WebSocket (~2-3s)</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-foreground">HuggingFace:</strong>
                <span className="text-muted-foreground">ML-based (~2-5s, 80-95% accuracy)</span>
              </li>
              <li className="flex flex-col">
                <strong className="text-foreground">Gemini AI:</strong>
                <span className="text-muted-foreground">Multimodal analysis (~3-6s)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
