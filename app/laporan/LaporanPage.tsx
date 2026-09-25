'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, FolderOpen } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { api, buktiUrl } from '@/lib/api';
import { IzinItem } from '@/types';
import { tanggalPanjang, rentangDefaultAwal, tanggalHariIni } from '@/lib/utils';

function LaporanView() {
  const user = useAppUser();
  const [rows, setRows] = useState<IzinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setStartDate(rentangDefaultAwal());
    setEndDate(tanggalHariIni());
  }, []);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getLaporanIzin({
        kar_nik: user.kar_nik,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        setError(true);
      }
    } catch (e) {
      console.error('Error load laporan:', e);
      setRows([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate || endDate) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  return (
    <div className="space-y-4">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onRefresh={load}
        loading={loading}
      />

      {loading ? (
        <LoadingState label="Memuat laporan..." />
      ) : error ? (
        <ErrorState message="Gagal memuat laporan izin." onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-8 h-8" />}
          title="Tidak ada laporan"
          description="Izin yang sudah disetujui akan muncul di sini."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.ij_nomor} className="card p-4 flex gap-3">
              <div className="rounded-full bg-success-50 text-success-600 p-2 h-fit shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{r.alasan}</p>
                <p className="text-sm text-ink-soft mt-0.5">{tanggalPanjang(r.tanggal)}</p>
                {r.keterangan && <p className="text-sm text-ink mt-1.5">{r.keterangan}</p>}
                {r.ij_foto && (
                  <a
                    href={buktiUrl(r.ij_foto)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lihat foto
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function LaporanPage() {
  return (
    <AppShell title="Laporan Izin">
      <LaporanView />
    </AppShell>
  );
}