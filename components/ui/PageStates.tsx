'use client';

import { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && <div className="text-ink-soft mb-3">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-ink-soft gap-3">
      <LoadingSpinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title="Terjadi kesalahan"
      description={message}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="px-4 py-2.5 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            Coba lagi
          </button>
        ) : undefined
      }
    />
  );
}