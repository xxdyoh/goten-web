'use client';

import { IzinStatus } from '@/types';

const styles: Record<IzinStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-warning-50 text-warning-700' },
  ACCEPT: { label: 'Disetujui', cls: 'bg-success-50 text-success-700' },
  REJECT: { label: 'Ditolak', cls: 'bg-danger-50 text-danger-700' },
};

export default function StatusBadge({ status }: { status: IzinStatus }) {
  const s = styles[status] ?? styles.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}