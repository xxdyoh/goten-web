import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  resolution: string;
  language: string;
}

export function getBrowserInfo(): BrowserInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    resolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
  };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
}

const namaBulan: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const namaHari: string[] = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// "2025-09-25 07:12:33" dan jam "07:12:33" sama-sama aman dipakai.
function tokenJam(v?: string): string | null {
  if (!v) return null;
  const t = v.split(' ').pop() ?? '';
  if (/\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  return null;
}

export function jamSaja(v?: string): string {
  return tokenJam(v) ?? '--:--';
}

export function tanggalPanjang(dt: string): string {
  const d = new Date(dt.replace(' ', 'T') + (dt.includes(' ') ? '' : 'T00:00:00'));
  if (isNaN(d.getTime())) return dt;
  return `${d.getDate()} ${namaBulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalHari(tanggal: string): string {
  const d = new Date(tanggal.replace(' ', 'T'));
  if (isNaN(d.getTime())) return tanggal;
  return `${namaHari[d.getDay()]}, ${tanggalPanjang(tanggal)}`;
}

// Rentang default: awal bulan tahun berjalan sampai hari ini (untuk filter laporan).
export function rentangDefaultAwal(): string {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
}

export function tanggalHariIni(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}