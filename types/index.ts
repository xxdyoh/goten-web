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

export type IzinStatus = 'PENDING' | 'ACCEPT' | 'REJECT';

export interface IzinItem {
  ij_nomor: string;
  kar_nik: string;
  tanggal: string;
  alasan: string;
  keterangan?: string;
  ij_foto?: string;
  ij_status: IzinStatus;
  ij_shift?: number;
}

export interface ApprovalItem extends IzinItem {
  kar_nama?: string;
  nm_unit?: string;
}

export interface HistoryItem {
  Nama: string;
  Tanggal: string;
  _IN?: string;
  _OUT?: string;
  Status?: string;
  shift?: number;
  shift_name?: string;
}

export interface StatistikItem {
  Nama: string;
  JumlahTerlambat: number;
  JumlahTepatWaktu: number;
  PersentaseTerlambat: number;
  PersentaseTepatWaktu: number;
}