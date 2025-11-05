export interface User {
  kar_nik: string;
  kar_nama: string;
  kar_kd_unit: string;
  nama_unit?: string;
}

export interface Attendance {
  id?: string;
  kar_nik: string;
  tanggal: string;
  kd_cabang: string;
  latitude: string;
  longitude: string;
  status?: 'present' | 'absent' | 'late' | 'leave';
}

export interface Unit {
  kd_unit: string;
  nm_unit: string;
  latitude: number;
  longitude: number;
}

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  resolution: string;
  language: string;
}