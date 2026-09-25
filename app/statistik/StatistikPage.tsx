'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import { api } from '@/lib/api';
import { StatistikItem } from '@/types';

function Donut({ tepat, terlambat }: { tepat: number; terlambat: number }) {
  const total = tepat + terlambat;
  if (total === 0) return null;
  const tepatPct = (tepat / total) * 100;
  const terlambatPct = (terlambat / total) * 100;
  return (
    <div
      className="w-44 h-44 rounded-full"
      style={{
        background: `conic-gradient(#00A86B 0deg ${tepatPct * 3.6}deg, #FF8C42 ${tepatPct * 3.6}deg ${(tepatPct + terlambatPct) * 3.6}deg)`,
        WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%)',
        mask: 'radial-gradient(circle, transparent 58%, black 60%)',
      }}
      role="img"
      aria-label={`Persentase tepat waktu ${tepatPct.toFixed(1)} persen, terlambat ${terlambatPct.toFixed(1)} persen`}
    />
  );
}

function StatistikView() {
  const user = useAppUser();
  const [data, setData] = useState<StatistikItem | null>(null);
  const [mode, setMode] = useState<'bln_ini' | 'all'>('bln_ini');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async (m: 'bln_ini' | 'all') => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getStatistik(user.kar_nama, m);
      if (res.success && res.data && res.data.length > 0) {
        setData(res.data[0]);
      } else {
        setData(null);
        setError(true);
      }
    } catch (e) {
      console.error('Error load statistik:', e);
      setData(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const tepat = data ? Number(data.PersentaseTepatWaktu ?? 0) : 0;
  const terlambat = data ? Number(data.PersentaseTerlambat ?? 0) : 0;
  const perfect = data !== null && tepat >= 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5">
          {(['bln_ini', 'all'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm ${
                mode === m ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-gray-50'
              }`}
            >
              {m === 'bln_ini' ? 'Bulan ini' : 'Keseluruhan'}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(mode)}
          disabled={loading}
          className="p-2.5 rounded-md border border-gray-200 bg-white text-ink-soft hover:bg-gray-50 disabled:opacity-50"
          aria-label="Muat ulang statistik"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <LoadingState label="Menghitung statistik..." />
      ) : error || !data ? (
        <ErrorState message="Belum ada data statistik untuk ditampilkan." onRetry={() => load(mode)} />
      ) : (
        <>
          <div className="card p-6">
            <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" />
              {mode === 'bln_ini' ? 'Persentase bulan ini' : 'Persentase keseluruhan'}
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Donut tepat={tepat} terlambat={terlambat} />
              <ul className="w-full sm:w-auto text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success-600" />
                  <span className="text-ink-soft">Tepat waktu</span>
                  <span className="font-semibold text-ink ml-auto">{tepat.toFixed(1)}%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning-700" />
                  <span className="text-ink-soft">Terlambat</span>
                  <span className="font-semibold text-ink ml-auto">{terlambat.toFixed(1)}%</span>
                </li>
              </ul>
            </div>
            {perfect && (
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-success-50 text-success-700 p-3 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Semua absensi tercatat tepat waktu pada periode ini.
              </div>
            )}
          </div>

          <div className="card p-5 text-sm text-ink-soft space-y-1.5">
            <p className="font-semibold text-ink flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-700" />
              Apa arti angka ini
            </p>
            <p>
              Persentase dihitung dari jumlah hari masuk dibandingkan jam masuk standar 08:00. Periode bulan ini
              mengikuti jendela berjalan sejak tanggal 25 bulan sebelumnya, sama seperti aplikasi mobile.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function StatistikPage() {
  return (
    <AppShell title="Statistik Absensi">
      <StatistikView />
    </AppShell>
  );
}