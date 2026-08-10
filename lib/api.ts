import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = {
  // Auth endpoints
  async generateOTP(kar_nik: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/generate-otp`, {
      kar_nik
    });
    return response.data;
  },

  async login(kar_nik: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      kar_nik,
      password
    });
    return response.data;
  },

  async verifyOTPLogin(kar_nik: string, otp: string, browser_info: any) {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      kar_nik,
      otp,
      browser_info
    });
    return response.data;
  },

  // Verify token endpoint
  async verifyToken(token: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-token`, {
      token
    });
    return response.data;
  },

  // Unit endpoints
  async getUnitData(kd_unit: string) {
    const response = await axios.get(`${API_BASE_URL}/unit/${kd_unit}`);
    return response.data;
  },

  // Attendance endpoints
  async submitAttendance(data: {
    kar_nik: string;
    tanggal: string;
    kd_cabang: string;
    latitude: string;
    longitude: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/absensi/tambahcoba`, data);
    return response.data;
  },

  async getTodayAttendance(kar_nama: string) {
    const response = await axios.post(`${API_BASE_URL}/absensi/hari-ini`, {
      kar_nama
    });
    return response.data;
  },

  async getAttendanceHistory(kar_nama: string) {
    const response = await axios.post(`${API_BASE_URL}/absensi/history`, {
      kar_nama
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
};