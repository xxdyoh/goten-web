'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Lock, FileText } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import StatusBadge from '@/components/ui/StatusBadge';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { useToast } from '@/components/ui/ToastProvider';
import { api, buktiUrl } from '@/lib/api';
import { ApprovalItem, IzinStatus } from '@/types';
import { tanggalPanjang } from '@/lib/utils';

const STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ALL', label: 'Semua' },
  { value: 'ACCEPT', label: 'Disetujui' },
  { value: 'REJECT', label: 'Ditolak' },
];

function ApprovalView() {
  const user = useAppUser();
  const toast = useToast();
  const [rows, setRows] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [noAccess, setNoAccess] = useState(false);
  const [kdUnits, setKdUnits] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('PENDING');

  const load = async () => {
    setLoading(true);
    setError(false);
    let units = kdUnits;
    if (units.length === 0) {
      try {
        const role = await api.cekRoleApproval(user.kar_nik);
        if (!role?.success || !role.is_approver || !role.kd_units?.length) {
          setNoAccess(true);
          setLoading(false);
          return;
        }
        units = role.kd_units.map((e: any) => e.toString());
        setKdUnits(units);
      } catch (e) {
        console.error('Error cek role approval:', e);
        setNoAccess(true);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await api.getApprovalList({
        kd_units: units.join(','),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status: status === 'ALL' ? undefined : status,
      });
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        setError(true);
      }
    } catch (e) {
      console.error('Error load approval:', e);
      setRows([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, status]);

  const handleProses = async (ij_nomor: string, ij_status: 'ACCEPT' | 'REJECT') => {
    const res = await api.prosesIzin(ij_nomor, ij_status);
    if (res.success) {
      toast.show('success', ij_status === 'ACCEPT' ? 'Izin diterima' : 'Izin ditolak');
      load();
    } else {
      toast.show('error', res.message || 'Gagal memproses izin');
    }
  };

  if (noAccess) {
    return (
      <EmptyState
        icon={<Lock className="w-8 h-8" />}
        title="Tidak ada akses"
        description="Halaman ini khusus atasan unit yang ditunjuk sebagai penyetuju izin. Anda tidak memiliki akses."
      />
    );
  }

  if (loading) return <LoadingState label="Memuat pengajuan..." />;
  if (error) return <ErrorState message="Gagal memuat daftar pengajuan." onRetry={load} />;

  return (
    <div className="space-y-4">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        status={status}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        onStatusChange={setStatus}
        onRefresh={load}
        loading={loading}
        statuses={STATUSES}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="Tidak ada pengajuan"
          description="Pengajuan izin yang menunggu konfirmasi akan muncul di sini."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.ij_nomor} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink">{r.kar_nama ?? '-'}</p>
                    <StatusBadge status={(r.ij_status as IzinStatus) ?? 'PENDING'} />
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">
                    {r.nm_unit ?? ''}{r.nm_unit && ' · '}{tanggalPanjang(r.tanggal)}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 space-y-1.5">
                <p className="text-sm font-medium text-ink">{r.alasan}</p>
                {r.keterangan && <p className="text-sm text-ink-soft">{r.keterangan}</p>}
                {r.ij_foto && (
                  <a
                    href={buktiUrl(r.ij_foto)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Lihat foto
                  </a>
                )}
              </div>
              {r.ij_status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleProses(r.ij_nomor, 'ACCEPT')}
                    className="flex items-center justify-center gap-2 py-3 rounded-md bg-success-600 text-white hover:bg-success-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Terima
                  </button>
                  <button
                    onClick={() => handleProses(r.ij_nomor, 'REJECT')}
                    className="flex items-center justify-center gap-2 py-3 rounded-md bg-danger-600 text-white hover:bg-danger-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <AppShell title="Persetujuan Izin">
      <ApprovalView />
    </AppShell>
  );
}