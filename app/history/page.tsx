'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/authClient';
import CallTable from '@/components/CallTable';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [strategyFilter, setStrategyFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();
  const { data: session, isPending: authLoading } = authClient.useSession();

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [router, session, authLoading]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['calls', page, strategyFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (strategyFilter) params.append('strategy', strategyFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/calls?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }

      return response.json();
    },
    refetchInterval: 3000, // Poll every 3 seconds for updates
    enabled: !!session && !authLoading, // Only run query if authenticated
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleExportCSV = () => {
    if (!data?.calls || data.calls.length === 0) return;

    const headers = ['Phone', 'Strategy', 'Status', 'AMD Result', 'Confidence', 'Created At'];
    const rows = data.calls.map((call: any) => [
      call.phone,
      call.strategy,
      call.status,
      call.amdResult || '',
      call.confidence != null ? call.confidence.toString() : '',
      new Date(call.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-history-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Call History
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            View and manage all your call records with AMD detection results.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!data?.calls || data.calls.length === 0}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="strategy" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Strategy
          </label>
          <select
            id="strategy"
            value={strategyFilter}
            onChange={(e) => {
              setStrategyFilter(e.target.value);
              setPage(1);
            }}
            className="mt-1 block w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">All Strategies</option>
            <option value="twilio">Twilio</option>
            <option value="huggingface">Hugging Face</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mt-1 block w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="ringing">Ringing</option>
            <option value="answered">Answered</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            Error loading calls. Please try again.
          </p>
        </div>
      )}

      <CallTable calls={data?.calls || []} isLoading={isLoading} />

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total calls)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= data.pagination.pages}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
