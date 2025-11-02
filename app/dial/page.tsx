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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Make a Call
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enter a phone number and select an AMD strategy to initiate a call.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <DialForm onSuccess={handleSuccess} />
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          How it works
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>Enter a phone number in E.164 format (e.g., +12345678900)</li>
          <li>Choose an AMD strategy:
            <ul className="mt-1 list-disc pl-5">
              <li><strong>Twilio Native:</strong> Fast, built-in detection (~1-2s, 70-90% accuracy)</li>
              <li><strong>Hugging Face:</strong> ML-based detection (~2-5s, 80-95% accuracy, requires service)</li>
            </ul>
          </li>
          <li>Optionally enable "Connect on human" to handle live calls automatically</li>
          <li>Click "Dial Now" to initiate the call</li>
          <li>Check the History page to see call results and AMD detection outcomes</li>
        </ol>
      </div>
    </div>
  );
}
