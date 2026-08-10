export interface User {
  kar_nik: string;
  kar_nama: string;
  kar_kd_unit: string;
  kar_kd_jabat?: string;
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

export interface RotiQUnit {
  kd_unit: string;
  nm_unit: string;
  latitude: number;
  longitude: number;
}

export interface POD {
  pod_nomor: string;
  pod_do_nomor: string;
  pod_tanggal: string;
  pod_foto?: string;
  pod_cus_kode: string;
  Cus_nama?: string;
  Cus_alamat?: string;
  date_create?: string;
  user_create?: string;
}

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  resolution: string;
  language: string;
}