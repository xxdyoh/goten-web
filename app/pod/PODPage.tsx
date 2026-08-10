'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Search, Plus, Trash2, Calendar, FileCheck, X } from 'lucide-react';
import { api } from '@/lib/api';
import { authService } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { POD } from '@/types';

export default function PODPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [podList, setPodList] = useState<POD[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [selectedDO, setSelectedDO] = useState<any>(null);
  const [showDOModal, setShowDOModal] = useState(false);
  const [podTanggal, setPodTanggal] = useState('');
  const [podFoto, setPodFoto] = useState<File | null>(null);
  const [podFotoPreview, setPodFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await authService.checkAuth();
        if (!result.authenticated) {
          router.push('/login');
          return;
        }
        if (result.user) {
          setUser(result.user);
          const response = await api.getPOD({
            kar_nik: result.user.kar_nik,
            start_date: startDate,
            end_date: endDate
          });
          if (response.success) setPodList(response.data || []);
        }
      } catch (e: any) {
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSearchDO = async (keyword?: string) => {
    if (!user?.kar_nik) return;
    setSearching(true);
    try {
      const response = await api.cariDO({
        kar_nik: user.kar_nik,
        start_date: startDate,
        keyword: keyword || searchKeyword
      });
      if (response.success) setSearchResults(response.data || []);
    } catch (e) {
      setError('Gagal mencari DO');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDO = (doData: any) => {
    setSelectedDO(doData);
    setSearchKeyword('');
    setSearchResults([]);
    setShowDOModal(false);
  };

  useEffect(() => {
    if (showDOModal && searchKeyword === '' && searchResults.length === 0) {
      handleSearchDO('');
    }
  }, [showDOModal]);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      setPodFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPodFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user?.kar_nik || !selectedDO || !podFoto) {
      setError('Data tidak lengkap');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.tambahPOD({
        kar_nik: user.kar_nik,
        pod_do_nomor: selectedDO.Nomor,
        pod_tanggal: podTanggal,
        pod_foto: podFotoPreview || '',
        pod_cus_kode: selectedDO.Cus_kode
      });
      if (response.success) {
        alert('POD berhasil dibuat!');
        setShowForm(false);
        setSelectedDO(null);
        setPodFoto(null);
        setPodFotoPreview(null);
        const res = await api.getPOD({
          kar_nik: user.kar_nik,
          start_date: startDate,
          end_date: endDate
        });
        if (res.success) setPodList(res.data || []);
      } else {
        setError(response.message || 'Gagal membuat POD');
      }
    } catch (e) {
      setError('Gagal membuat POD');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePOD = async (podNomor: string) => {
    if (!window.confirm('Hapus POD ini?')) return;
    if (!user?.kar_nik) return;
    try {
      const response = await api.hapusPOD({
        kar_nik: user.kar_nik,
        pod_nomor: podNomor
      });
      if (response.success) {
        alert('POD dihapus!');
        const res = await api.getPOD({
          kar_nik: user.kar_nik,
          start_date: startDate,
          end_date: endDate
        });
        if (res.success) setPodList(res.data || []);
      } else {
        setError(response.message || 'Gagal menghapus POD');
      }
    } catch (e) {
      setError('Gagal menghapus POD');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman POD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <X className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Proof of Delivery</h1>
            </div>
            <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{showForm ? 'Tambah POD Baru' : 'Buat POD Baru'}</h2>
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setSelectedDO(null);
                    setPodFoto(null);
                    setPodFotoPreview(null);
                    setSearchKeyword('');
                    setShowDOModal(false);
                    setPodTanggal(today);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {showForm ? <X className="w-5 h-5 text-gray-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                </button>
              </div>

              {showForm && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowDOModal(true)}
                    disabled={selectedDO !== null}
                    className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${selectedDO ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {selectedDO ? (
                      <>
                        <FileCheck className="w-5 h-5" />
                        <span>DO Terpilih - Klik X untuk ganti</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Cari & Pilih DO</span>
                      </>
                    )}
                  </button>

                  {showDOModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-800">Pilih DO</h3>
                          <button onClick={() => setShowDOModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={searchKeyword}
                              onChange={(e) => setSearchKeyword(e.target.value)}
                              placeholder="Ketik DO/Customer..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleSearchDO()}
                              disabled={searching}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                              {searching ? <LoadingSpinner size="sm" /> : <Search className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                          {searchResults.length > 0 ? (
                            <div className="space-y-1">
                              {searchResults.map((doData: any, idx: number) => (
                                <div
                                  key={idx}
                                  onClick={() => handleSelectDO(doData)}
                                  className={`p-3 cursor-pointer border rounded-lg ${selectedDO?.Nomor === doData.Nomor ? 'bg-green-50 border-green-200' : 'hover:bg-blue-50 border-gray-200'}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-gray-900 text-lg">{doData.Nomor}</div>
                                      <div className="text-sm text-gray-600">{doData.Customer}</div>
                                      <div className="text-xs text-gray-500 mt-1">{doData.Alamat}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-700">{doData.Tanggal}</div>
                                      {selectedDO?.Nomor === doData.Nomor && (
                                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Terpilih</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              {searching ? 'Mencari...' : 'Ketik keyword untuk mencari DO'}
                            </div>
                          )}
                        </div>
                        <div className="p-4 border-t border-gray-200 text-center">
                          <button onClick={() => setShowDOModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Tutup</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDO && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium text-sm">DO Terpilih:</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Nomor:</span> {selectedDO.Nomor}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Customer:</span> {selectedDO.Customer}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Alamat:</span> {selectedDO.Alamat}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Tanggal:</span> {selectedDO.Tanggal}
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedDO(null); setSearchKeyword(''); setSearchResults([]); }}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedDO && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Tanggal POD</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="date"
                          value={podTanggal}
                          onChange={(e) => setPodTanggal(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {selectedDO && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Upload Foto</label>
                      {podFotoPreview ? (
                        <div className="relative">
                          <img src={podFotoPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                          <button
                            onClick={() => { setPodFoto(null); setPodFotoPreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                            <p className="text-xs text-gray-400">Maks 5MB</p>
                          </div>
                          <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  )}

                  {selectedDO && podFoto && (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-5 h-5" />
                          <span>Buat POD</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Daftar POD</h2>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Dari Tanggal" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Sampai Tanggal" />
                  <button 
                    onClick={async () => {
                      try {
                        const res = await api.getPOD({
                          kar_nik: user.kar_nik,
                          start_date: startDate,
                          end_date: endDate
                        });
                        if (res.success) setPodList(res.data || []);
                      } catch (e) {
                        setError('Gagal memuat POD');
                      }
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {podList.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada data POD</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DO</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {podList.map((pod: POD, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{pod.pod_nomor}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pod.pod_do_nomor}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pod.Cus_nama || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{pod.pod_tanggal}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Selesai</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleDeletePOD(pod.pod_nomor)} 
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50" 
                              title="Hapus POD"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
