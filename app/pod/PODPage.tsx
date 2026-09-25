'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Search, Plus, Trash2, X, Truck, AlertCircle } from 'lucide-react';
import AppShell, { useAppUser } from '@/components/AppShell';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/PageStates';
import { useToast } from '@/components/ui/ToastProvider';
import { api } from '@/lib/api';
import { POD } from '@/types';
import { tanggalPanjang, tanggalHariIni } from '@/lib/utils';

export default function PODPage() {
  const user = useAppUser();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [podList, setPodList] = useState<POD[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const today = tanggalHariIni();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [selectedDO, setSelectedDO] = useState<any>(null);
  const [showDOModal, setShowDOModal] = useState(false);
  const [podTanggal, setPodTanggal] = useState(today);
  const [podFoto, setPodFoto] = useState<File | null>(null);
  const [podFotoPreview, setPodFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const loadedRef = useRef(false);

  const loadPOD = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.getPOD({
        kar_nik: user.kar_nik,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (res.success) setPodList(res.data || []);
      else setError(true);
    } catch (e) {
      console.error('Error load POD:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadPOD();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showDOModal && searchKeyword === '' && searchResults.length === 0) {
      handleSearchDO('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDOModal]);

  const handleSearchDO = async (keyword?: string) => {
    if (!user?.kar_nik) return;
    setSearching(true);
    try {
      const res = await api.cariDO({
        kar_nik: user.kar_nik,
        start_date: startDate || undefined,
        keyword: keyword || searchKeyword,
      });
      if (res.success) setSearchResults(res.data || []);
    } catch (e) {
      console.error('Error cari DO:', e);
      toast.show('error', 'Gagal mencari DO');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDO = (doData: any) => {
    setSelectedDO(doData);
    setSearchKeyword('');
    setSearchResults([]);
    setShowDOModal(false);
    setPodTanggal(today);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxW = 1024;
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.show('error', 'Ukuran file maksimal 5MB');
      return;
    }
    setPodFoto(file);
    setPodFotoPreview(await compressImage(file));
  };

  const handleSubmit = async () => {
    if (!user?.kar_nik || !selectedDO || !podFoto) {
      toast.show('error', 'Lengkapi DO dan foto terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.tambahPOD({
        kar_nik: user.kar_nik,
        pod_do_nomor: selectedDO.Nomor,
        pod_tanggal: podTanggal,
        pod_foto: podFotoPreview || '',
        pod_cus_kode: selectedDO.Cus_kode,
      });
      if (res.success) {
        toast.show('success', 'POD berhasil dibuat');
        resetForm();
        loadPOD();
      } else {
        toast.show('error', res.message || 'Gagal membuat POD');
      }
    } catch (e) {
      console.error('Error tambah POD:', e);
      toast.show('error', 'Gagal membuat POD');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePOD = async (podNomor: string) => {
    if (!window.confirm('Hapus POD ini?')) return;
    try {
      const res = await api.hapusPOD({ kar_nik: user.kar_nik, pod_nomor: podNomor });
      if (res.success) {
        toast.show('success', 'POD dihapus');
        loadPOD();
      } else {
        toast.show('error', res.message || 'Gagal menghapus POD');
      }
    } catch (e) {
      console.error('Error hapus POD:', e);
      toast.show('error', 'Gagal menghapus POD');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedDO(null);
    setPodFoto(null);
    setPodFotoPreview(null);
    setSearchKeyword('');
    setShowDOModal(false);
    setPodTanggal(today);
  };

  const toggleForm = () => {
    if (showForm) resetForm();
    else {
      setShowForm(true);
      setPodTanggal(today);
    }
  };

  return (
    <AppShell title="Proof of Delivery" right={null}>
      <div className="space-y-6">
        {error && !loading && (
          <div className="flex items-center gap-2 rounded-lg bg-danger-50 border border-danger-600/30 text-danger-700 px-4 py-3 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">Gagal memuat data POD.</span>
            <button onClick={loadPOD} className="font-medium underline">
              Muat ulang
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
            Dari
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
            Sampai
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white"
            />
          </label>
          <button
            onClick={loadPOD}
            disabled={loading}
            className="px-4 py-2.5 min-h-11 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50"
          >
            Filter
          </button>
          <button
            onClick={toggleForm}
            className="sm:ml-auto flex items-center gap-2 px-4 py-2.5 min-h-11 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Tutup form' : 'Buat POD baru'}
          </button>
        </div>

        {showForm && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-ink">Buat POD baru</h2>

            <button
              onClick={() => setShowDOModal(true)}
              disabled={selectedDO !== null}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md ${
                selectedDO ? 'bg-gray-100 text-ink-soft' : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {selectedDO ? (
                <>
                  <FileText className="w-4 h-4" />
                  <span>{selectedDO.Nomor}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cari dan pilih DO</span>
                </>
              )}
            </button>

            {selectedDO && (
              <div className="space-y-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                  Tanggal POD
                  <input
                    type="date"
                    value={podTanggal}
                    onChange={(e) => setPodTanggal(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                  Foto pengiriman
                  {podFotoPreview ? (
                    <span className="relative">
                      <img src={podFotoPreview} alt="Pratinjau foto POD" className="w-full h-40 object-cover rounded-md border border-gray-200" />
                      <button
                        onClick={() => {
                          setPodFoto(null);
                          setPodFotoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-danger-600 text-white"
                        aria-label="Hapus foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md px-4 py-8 text-sm text-ink-soft cursor-pointer hover:border-primary">
                      <Upload className="w-4 h-4" />
                      Pilih foto (maks 5MB)
                      <input type="file" accept="image/*" className="sr-only" onChange={handleFotoChange} />
                    </span>
                  )}
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !podFoto}
                  className="w-full py-3 rounded-md bg-success-600 text-white hover:bg-success-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Buat POD'}
                </button>
              </div>
            )}
          </div>
        )}

        {showDOModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pilih DO"
            className="fixed inset-0 bg-black/40 z-40"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDOModal(false);
            }}
          >
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 sm:p-6">
              <div className="bg-white sm:rounded-lg sm:border sm:border-gray-200 w-full sm:max-w-lg sm:shadow-lg max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-ink">Pilih DO</h3>
                  <button onClick={() => setShowDOModal(false)} className="p-2 -m-2 rounded-md text-ink-soft hover:bg-gray-100" aria-label="Tutup">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="px-5 py-3 border-b border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchDO();
                    }}
                    placeholder="Ketik nomor DO atau customer"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink bg-white"
                  />
                  <button
                    onClick={() => handleSearchDO()}
                    disabled={searching}
                    className="px-3 py-2.5 rounded-md bg-primary-600 text-white disabled:opacity-50"
                    aria-label="Cari"
                  >
                    {searching ? '...' : <Search className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((doData: any, idx: number) => (
                      <button
                        key={`${doData.Nomor}-${idx}`}
                        onClick={() => handleSelectDO(doData)}
                        className="w-full text-left p-3 rounded-md border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50"
                      >
                        <p className="font-semibold text-ink text-sm">{doData.Nomor}</p>
                        <p className="text-sm text-ink-soft">{doData.Customer}</p>
                        <p className="text-xs text-ink-soft mt-0.5">{doData.Alamat}</p>
                        <p className="text-xs text-ink-soft mt-1">Tanggal DO: {doData.Tanggal}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-ink-soft py-8">
                      {searching ? 'Mencari...' : 'Tidak ada hasil. Coba kata kunci lain.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary-600" />
            Daftar POD
          </h2>

          {loading ? (
            <LoadingState label="Memuat POD..." />
          ) : podList.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="Belum ada data POD"
              description="POD yang dibuat pada rentang tanggal ini akan muncul di sini."
            />
          ) : (
            <ul className="space-y-3">
              {podList.map((pod, idx) => (
                <li key={`${pod.pod_nomor}-${idx}`} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm">{pod.pod_nomor}</p>
                      <p className="text-sm text-ink-soft mt-0.5">DO: {pod.pod_do_nomor}</p>
                      <p className="text-sm text-ink-soft">{pod.Cus_nama || '-'}</p>
                      <p className="text-xs text-ink-soft mt-0.5">{tanggalPanjang(pod.pod_tanggal)}</p>
                    </div>
                    <span className="rounded-full bg-success-50 text-success-700 text-xs px-2.5 py-1 shrink-0">Selesai</span>
                    <button
                      onClick={() => handleDeletePOD(pod.pod_nomor)}
                      className="p-2 rounded-md text-danger-600 hover:bg-danger-50 shrink-0"
                      aria-label="Hapus POD"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}