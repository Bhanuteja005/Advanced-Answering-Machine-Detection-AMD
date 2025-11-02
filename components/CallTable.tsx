'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface Call {
  id: string;
  phone: string;
  strategy: string;
  status: string;
  amdResult: string | null;
  confidence: number | null;
  twilioSid: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CallTableProps {
  calls: Call[];
  isLoading?: boolean;
}

export default function CallTable({ calls, isLoading }: CallTableProps) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState<'human' | 'machine' | 'undecided'>('human');
  const queryClient = useQueryClient();

  const overrideMutation = useMutation({
    mutationFn: async ({ callId, amdResult }: { callId: string; amdResult: string }) => {
      const response = await fetch(`/api/calls/${callId}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amdResult }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to override AMD result');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      setSelectedCall(null);
    },
  });

  const handleOverride = (callId: string) => {
    overrideMutation.mutate({ callId, amdResult: overrideValue });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      initiated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      ringing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
      answered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const getAmdBadge = (amdResult: string | null) => {
    if (!amdResult) return <span className="text-zinc-400">-</span>;

    const styles: Record<string, string> = {
      human: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      machine: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      undecided: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          styles[amdResult] || styles.undecided
        }`}
      >
        {amdResult}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"></div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          No calls found. Start by dialing a number!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Strategy
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              AMD Result
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {calls.map((call) => (
            <tr key={call.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                {call.phone}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {call.strategy}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {getStatusBadge(call.status)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {getAmdBadge(call.amdResult)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {call.confidence != null ? `${(call.confidence * 100).toFixed(0)}%` : '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(call.createdAt).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {selectedCall === call.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={overrideValue}
                      onChange={(e) =>
                        setOverrideValue(e.target.value as 'human' | 'machine' | 'undecided')
                      }
                      className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="human">Human</option>
                      <option value="machine">Machine</option>
                      <option value="undecided">Undecided</option>
                    </select>
                    <button
                      onClick={() => handleOverride(call.id)}
                      disabled={overrideMutation.isPending}
                      className="rounded bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setSelectedCall(null)}
                      className="rounded bg-zinc-200 px-2 py-1 text-xs text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedCall(call.id)}
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Override
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
