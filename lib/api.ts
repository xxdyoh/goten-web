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

  async verifyOTPLogin(kar_nik: string, otp: string, browser_info: any) {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      kar_nik,
      otp,
      browser_info
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
  }
};