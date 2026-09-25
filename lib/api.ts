import axios from 'axios';

// 1 backend (goten-api), 2 frontend. Web memakai endpoint goten-api (tanpa prefix /api).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://103.103.22.7/cutikaryawan/upload.php';
const BUKTI_URL = process.env.NEXT_PUBLIC_BUKTI_URL || 'http://103.103.22.7/cutikaryawan/bukti';

// URL file bukti foto izin yang sudah terupload
export function buktiUrl(filename?: string): string | undefined {
  if (!filename) return undefined;
  return `${BUKTI_URL}/${filename}`;
}

// Upload foto izin ke server upload eksternal (mirror app mobile)
export async function uploadFoto(file: File): Promise<{ success: boolean; filename?: string; message?: string }> {
  const form = new FormData();
  form.append('prefix', 'IZ');
  form.append('file', file);
  try {
    const res = await fetch(UPLOAD_URL, { method: 'POST', body: form });
    const data = await res.json();
    return { success: data?.status === 'success', filename: data?.filename, message: data?.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Gagal mengunggah foto' };
  }
}

export interface ShiftItem {
  kd_shift: number;
  nm_shift: string;
  jam_mulai: string;
  jam_selesai: string;
  toleransi_mulai: string;
  toleransi_selesai: string;
}

export const api = {
  // Auth endpoints (login password, sesi tunggal web)
  async login(kar_nik: string, password: string, device_id: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      kar_nik,
      password,
      device_id,
      client_type: 'web',
    });
    return response.data;
  },

  // Verify token, kirim device_id agar sesi perangkat lain terdeteksi
  async verifyToken(token: string, device_id: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-token`, {
      token,
      device_id,
    });
    return response.data;
  },

  async logout(token: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`, { token });
    return response.data;
  },

  // Unit endpoints
  async getUnitData(kd_unit: string) {
    const response = await axios.get(`${API_BASE_URL}/unit/${kd_unit}`);
    return response.data;
  },

  // Daftar shift (cabang 20) + usulan shift default
  async getShifts() {
    const response = await axios.get(`${API_BASE_URL}/absensi/shift`);
    return response.data;
  },

  // Attendance endpoints (status_absen: 1 = check-in, 2 = check-out)
  async submitAttendance(data: {
    kar_nik: string;
    kd_cabang: string;
    latitude: string;
    longitude: string;
    status_absen: number;
    shift?: number;
  }) {
    const response = await axios.post(`${API_BASE_URL}/absensi/tambah`, data);
    return response.data;
  },

  async getTodayAttendance(kar_nama: string) {
    const response = await axios.post(`${API_BASE_URL}/absensi/hari-ini`, {
      kar_nama,
    });
    return response.data;
  },

  async getAttendanceHistory(kar_nama: string) {
    const response = await axios.post(`${API_BASE_URL}/absensi/history`, {
      kar_nama,
    });
    return response.data;
  },

  async getRotiQUnits() {
    const response = await axios.get(`${API_BASE_URL}/unitrotiq`);
    return response.data;
  },

  // POD endpoints
  async getPOD(data: { kar_nik: string; start_date?: string; end_date?: string }) {
    const response = await axios.post(`${API_BASE_URL}/pod/list`, data);
    return response.data;
  },

  async cariDO(data: { kar_nik: string; start_date?: string; keyword?: string }) {
    const response = await axios.post(`${API_BASE_URL}/pod/cari-do`, data);
    return response.data;
  },

  async tambahPOD(data: {
    kar_nik: string;
    pod_do_nomor: string;
    pod_tanggal: string;
    pod_foto: string;
    pod_cus_kode: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/pod/tambah`, data);
    return response.data;
  },

  async editPOD(data: {
    kar_nik: string;
    pod_nomor: string;
    pod_tanggal: string;
    pod_foto?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/pod/edit`, data);
    return response.data;
  },

  async hapusPOD(data: { kar_nik: string; pod_nomor: string }) {
    const response = await axios.post(`${API_BASE_URL}/pod/hapus`, data);
    return response.data;
  },

  // History absensi
  async getHistory(kar_nama: string) {
    const response = await axios.post(`${API_BASE_URL}/absensi/history`, { kar_nama });
    return response.data;
  },

  // Izin
  async getIzinList(data: {
    kar_nik: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/izin/list`, data);
    return response.data;
  },

  async tambahIzin(data: {
    kar_nik: string;
    tanggal: string;
    alasan: string;
    keterangan?: string;
    ij_foto?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/izin/tambah`, data);
    return response.data;
  },

  async editIzin(data: {
    ij_nomor: string;
    tanggal: string;
    alasan: string;
    keterangan?: string;
    ij_foto?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/izin/edit`, data);
    return response.data;
  },

  async hapusIzin(ij_nomor: string) {
    const response = await axios.post(`${API_BASE_URL}/izin/hapus`, { ij_nomor });
    return response.data;
  },

  async cekRoleApproval(kar_nik: string) {
    const response = await axios.post(`${API_BASE_URL}/izin/cek-role`, { kar_nik });
    return response.data;
  },

  async getApprovalList(data: {
    kd_units: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/izin/approval-list`, data);
    return response.data;
  },

  async prosesIzin(ij_nomor: string, ij_status: 'ACCEPT' | 'REJECT') {
    const response = await axios.post(`${API_BASE_URL}/izin/proses`, { ij_nomor, ij_status });
    return response.data;
  },

  async getSisaCuti(kar_nik: string) {
    const response = await axios.post(`${API_BASE_URL}/izin/sisa-cuti`, { kar_nik });
    return response.data;
  },

  async getLaporanIzin(data: {
    kar_nik: string;
    start_date?: string;
    end_date?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/izin/laporan`, data);
    return response.data;
  },

  async cekRotiqMobile(kar_nik: string) {
    const response = await axios.post(`${API_BASE_URL}/izin/cek-rotiq-mobile`, { kar_nik });
    return response.data;
  },

  // Statistik (endpoint memakai nama karyawan, bukan NIK)
  async getStatistik(nama: string, mode: 'bln_ini' | 'all' = 'bln_ini') {
    const response = await axios.post(`${API_BASE_URL}/statistik/${mode}`, { nama });
    return response.data;
  },
};