'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, LogIn, LogOut, ReceiptText } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import { api } from '@/lib/api';
import { HistoryItem } from '@/types';
import { tanggalHari, jamSaja } from '@/lib/utils';

function HistoryView() {
  const user = useAppUser();
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getHistory(user.kar_nama);
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        setError(true);
      }
    } catch (e) {
      console.error('Error load history:', e);
      setRows([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingState label="Memuat riwayat..." />;
  if (error) return <ErrorState message="Gagal memuat riwayat absensi." onRetry={load} />;
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="w-8 h-8" />}
        title="Belum ada riwayat"
        description="Lakukan absensi terlebih dahulu, riwayat akan muncul di sini."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r, idx) => {
        const onTime = r.Status === 'Tepat Waktu';
        return (
          <li key={`${r.Tanggal}-${idx}`} className="card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`rounded-full p-2 shrink-0 ${onTime ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-700'}`}
              >
                {onTime ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm">{tanggalHari(r.Tanggal)}</p>
                <p className="text-xs text-ink-soft">{r.Status ?? 'Tanpa status'}</p>
              </div>
              {r.shift ? (
                <span className="rounded-full bg-primary-50 text-primary-700 text-xs px-2.5 py-1">
                  Shift {r.shift} {r.shift_name ? `· ${r.shift_name}` : ''}
                </span>
              ) : null}
              <div className="flex gap-2 shrink-0">
                <span className="flex items-center gap-1.5 rounded-lg bg-success-50 text-success-700 px-3 py-1.5 text-sm font-medium">
                  <LogIn className="w-3.5 h-3.5" />
                  {jamSaja(r._IN)}
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-warning-50 text-warning-700 px-3 py-1.5 text-sm font-medium">
                  <LogOut className="w-3.5 h-3.5" />
                  {jamSaja(r._OUT)}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function HistoryPage() {
  return (
    <AppShell title="Riwayat Absensi">
      <HistoryView />
    </AppShell>
  );
}