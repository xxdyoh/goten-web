'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, CalendarClock, FileText, Image as ImageIcon, X } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import StatusBadge from '@/components/ui/StatusBadge';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { useToast } from '@/components/ui/ToastProvider';
import { api, buktiUrl, uploadFoto } from '@/lib/api';
import { IzinItem, IzinStatus } from '@/types';
import { tanggalPanjang, tanggalHariIni } from '@/lib/utils';

const ALASAN = ['Sakit', 'Cuti Tahunan', 'Setengah Hari'];

const STATUSES = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPT', label: 'Disetujui' },
  { value: 'REJECT', label: 'Ditolak' },
];

interface FormDraft {
  ij_nomor?: string;
  tanggal: string;
  alasan: string;
  keterangan: string;
  existingFoto?: string;
  hapusFoto: boolean;
}

function IzinForm({
  draft,
  onSubmit,
  onCancel,
}: {
  draft: FormDraft;
  onSubmit: (data: {
    tanggal: string;
    alasan: string;
    keterangan: string;
    ij_foto?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [tanggal, setTanggal] = useState(draft.tanggal || tanggalHariIni());
  const [alasan, setAlasan] = useState(draft.alasan || 'Sakit');
  const [keterangan, setKeterangan] = useState(draft.keterangan);
  const [file, setFile] = useState<File | null>(null);
  const [hapusFoto, setHapusFoto] = useState(draft.hapusFoto);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(draft.ij_nomor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal) {
      toast.show('error', 'Tanggal izin wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      let ij_foto: string | undefined;
      const removeFoto = hapusFoto || (isEdit && file === null && draft.existingFoto === undefined);
      if (!removeFoto) {
        if (file) {
          const up = await uploadFoto(file);
          if (!up.success || !up.filename) {
            toast.show('error', up.message || 'Gagal mengunggah foto');
            setSubmitting(false);
            return;
          }
          ij_foto = up.filename;
        } else {
          ij_foto = draft.existingFoto || undefined;
        }
      }
      await onSubmit({ tanggal: `${tanggal} 00:00:00`, alasan, keterangan, ij_foto });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit izin' : 'Izinkan izin baru'}>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onCancel}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-0 sm:p-6">
        <div className="bg-white sm:rounded-lg sm:border sm:border-gray-200 w-full sm:max-w-lg sm:shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <h2 className="font-semibold text-ink">{isEdit ? 'Edit izin' : 'Ajukan izin baru'}</h2>
            <button onClick={onCancel} className="p-2 -m-2 rounded-md text-ink-soft hover:bg-gray-100" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Tanggal
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Alasan
              <select
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white"
              >
                {ALASAN.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink">
              Keterangan
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                rows={3}
                placeholder="Tulis keterangan (opsional)"
                className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white focus:border-primary resize-y"
              />
            </label>

            <div className="flex flex-col gap-1 text-sm font-medium text-ink">
              <span>Foto pendukung</span>
              {draft.existingFoto && !hapusFoto ? (
                <div className="flex items-center gap-3 bg-gray-50 rounded-md p-2.5">
                  <img
                    src={buktiUrl(draft.existingFoto)}
                    alt="Foto izin tersimpan"
                    className="w-14 h-14 object-cover rounded-md"
                  />
                  <span className="text-xs text-ink-soft flex-1">{draft.existingFoto}</span>
                  <label className="flex items-center gap-1.5 text-xs text-danger-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hapusFoto}
                      onChange={(e) => setHapusFoto(e.target.checked)}
                    />
                    Hapus foto
                  </label>
                </div>
              ) : (
                <label className="flex items-center gap-2 justify-center border-2 border-dashed border-gray-300 rounded-md px-4 py-6 text-sm text-ink-soft cursor-pointer hover:border-primary">
                  {file ? (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      {file.name}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Pilih foto
                    </>
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-md border border-gray-300 text-ink hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? (isEdit ? 'Menyimpan...' : 'Mengirim...') : isEdit ? 'Simpan' : 'Ajukan izin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function IzinView() {
  const user = useAppUser();
  const toast = useToast();
  const [rows, setRows] = useState<IzinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ALL');
  const [draft, setDraft] = useState<FormDraft | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getIzinList({
        kar_nik: user.kar_nik,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status,
      });
      if (res.success && Array.isArray(res.data)) {
        setRows(res.data);
      } else {
        setRows([]);
        setError(true);
      }
    } catch (e) {
      console.error('Error load izin:', e);
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

  const handleHapus = async (ij_nomor: string) => {
    if (!window.confirm('Hapus pengajuan izin ini?')) return;
    const res = await api.hapusIzin(ij_nomor);
    if (res.success) {
      toast.show('success', 'Izin dihapus');
      load();
    } else {
      toast.show('error', res.message || 'Gagal menghapus izin');
    }
  };

  const handleSubmitForm = async (data: { tanggal: string; alasan: string; keterangan: string; ij_foto?: string }) => {
    if (draft?.ij_nomor) {
      const res = await api.editIzin({ ij_nomor: draft.ij_nomor, ...data });
      if (res.success) toast.show('success', 'Izin diperbarui');
      else toast.show('error', res.message || 'Gagal menyimpan');
    } else {
      const res = await api.tambahIzin({ kar_nik: user.kar_nik, ...data });
      if (res.success) toast.show('success', 'Izin diajukan');
      else toast.show('error', res.message || 'Gagal mengirim');
    }
    setDraft(null);
    load();
  };

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

      <div className="flex justify-end">
        <button
          onClick={() => setDraft({ tanggal: '', alasan: 'Sakit', keterangan: '', hapusFoto: false })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Ajukan izin
        </button>
      </div>

      {loading ? (
        <LoadingState label="Memuat izin..." />
      ) : error ? (
        <ErrorState message="Gagal memuat daftar izin." onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="w-8 h-8" />}
          title="Tidak ada pengajuan"
          description="Ajukan izin pertama Anda dari tombol di atas."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.ij_nomor} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ink">{r.alasan}</p>
                    <StatusBadge status={r.ij_status as IzinStatus} />
                  </div>
                  <p className="text-sm text-ink-soft mt-1">{tanggalPanjang(r.tanggal)}</p>
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
                {r.ij_status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        setDraft({
                          ij_nomor: r.ij_nomor,
                          tanggal: r.tanggal.slice(0, 10),
                          alasan: r.alasan,
                          keterangan: r.keterangan ?? '',
                          existingFoto: r.ij_foto,
                          hapusFoto: false,
                        })
                      }
                      className="p-2.5 rounded-md text-ink-soft hover:bg-gray-100 hover:text-ink"
                      aria-label={`Edit ${r.ij_nomor}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleHapus(r.ij_nomor)}
                      className="p-2.5 rounded-md text-danger-600 hover:bg-danger-50"
                      aria-label={`Hapus ${r.ij_nomor}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft && <IzinForm draft={draft} onSubmit={handleSubmitForm} onCancel={() => setDraft(null)} />}
    </div>
  );
}

export default function IzinPage() {
  return (
    <AppShell title="Pengajuan Izin">
      <IzinView />
    </AppShell>
  );
}