'use client';

import { RefreshCw } from 'lucide-react';

export default function DateRangeFilter({
  startDate,
  endDate,
  status,
  onStartChange,
  onEndChange,
  onStatusChange,
  onRefresh,
  loading,
  statuses,
}: {
  startDate: string;
  endDate: string;
  status?: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onStatusChange?: (v: string) => void;
  onRefresh: () => void;
  loading?: boolean;
  statuses?: { value: string; label: string }[];
}) {
  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
          Dari
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
          Sampai
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white focus:border-primary"
          />
        </label>
        {statuses && onStatusChange && (
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
            Status
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white min-w-32"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 min-h-11"
        >
          <span className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Muat ulang
          </span>
        </button>
      </div>
    </div>
  );
}