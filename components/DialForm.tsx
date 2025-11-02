'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DialFormProps {
  onSuccess?: () => void;
}

export default function DialForm({ onSuccess }: DialFormProps) {
  const [phone, setPhone] = useState('');
  const [strategy, setStrategy] = useState<'twilio' | 'twilio-stream' | 'huggingface' | 'gemini' | 'jambonz'>('twilio');
  const [connectOnHuman, setConnectOnHuman] = useState(false);
  const queryClient = useQueryClient();

  const dialMutation = useMutation({
    mutationFn: async (data: {
      phone: string;
      strategy: string;
      connectOnHuman: boolean;
    }) => {
      const response = await fetch('/api/dial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        // Use detailed message if available
        const errorMsg = error.message || error.error || 'Failed to initiate call';
        const fullError = new Error(errorMsg);
        (fullError as any).details = error;
        throw fullError;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      setPhone('');
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dialMutation.mutate({ phone, strategy, connectOnHuman });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+12345678900"
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Use E.164 format (e.g., +12345678900)
        </p>
      </div>

      <div>
        <label
          htmlFor="strategy"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          AMD Strategy
        </label>
        <select
          id="strategy"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value as 'twilio' | 'twilio-stream' | 'huggingface' | 'gemini' | 'jambonz')}
          className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        >
          <option value="twilio">1️⃣ Twilio Native AMD</option>
          <option value="twilio-stream">1️⃣A Twilio + Media Streams (Real-time)</option>
          <option value="huggingface">2️⃣ Hugging Face (wav2vec)</option>
          <option value="gemini">3️⃣ Google Gemini Flash</option>
          <option value="jambonz">4️⃣ Jambonz SIP AMD</option>
        </select>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {strategy === 'twilio' && 'Fast, built-in detection (~1-2s)'}
          {strategy === 'twilio-stream' && 'Real-time audio streaming with live detection (~2-3s, requires public URL)'}
          {strategy === 'huggingface' && 'ML-based audio analysis (~2-5s, requires Python service)'}
          {strategy === 'gemini' && 'AI-powered detection using Gemini (~3-6s)'}
          {strategy === 'jambonz' && 'SIP-based detection via Jambonz (~2-4s, requires SIP trunk)'}
        </p>
      </div>

      <div className="flex items-center">
        <input
          id="connectOnHuman"
          type="checkbox"
          checked={connectOnHuman}
          onChange={(e) => setConnectOnHuman(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
        />
        <label
          htmlFor="connectOnHuman"
          className="ml-2 block text-sm text-zinc-900 dark:text-zinc-50"
        >
          Connect on human detection
        </label>
      </div>

      <button
        type="submit"
        disabled={dialMutation.isPending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {dialMutation.isPending ? 'Dialing...' : 'Dial Now'}
      </button>

      {dialMutation.isError && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Call Failed
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {dialMutation.error.message}
              </p>
              {dialMutation.error.message.includes('verified') && (
                <div className="mt-3">
                  <a
                    href="https://console.twilio.com/us1/develop/phone-numbers/manage/verified"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Verify Phone Number in Twilio
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {dialMutation.isSuccess && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            Call initiated successfully! Check history for updates.
          </p>
        </div>
      )}
    </form>
  );
}
