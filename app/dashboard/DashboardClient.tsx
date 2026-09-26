'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  MapPin,
  ChevronRight,
  RefreshCw,
  LogIn,
  LogOut as LogOutIcon,
  ReceiptText,
  CalendarClock,
  FolderCheck,
  BarChart3,
  Truck,
  CheckCircle2,
  Leaf,
  Loader2,
} from 'lucide-react';
import LocationMap from '@/components/maps/LocationMap';
import { useToast } from '@/components/ui/ToastProvider';
import { api, ShiftItem } from '@/lib/api';
import { calculateDistance, jamSaja } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { User as UserType, Unit, RotiQUnit } from '@/types';

interface MenuItem {
  label: string;
  desc: string;
  to: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: -7.538982, lng: 110.844009 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRotiQMobile, setIsRotiQMobile] = useState(false);
  const [rotiQUnits, setRotiQUnits] = useState<RotiQUnit[]>([]);
  const [selectedRotiQUnit, setSelectedRotiQUnit] = useState<RotiQUnit | null>(null);

  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [selectedShift, setSelectedShift] = useState(1);

  const [sisaCuti, setSisaCuti] = useState<number | null>(null);
  const [isApprover, setIsApprover] = useState(false);
  const [kdUnits, setKdUnits] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const isUnit20 = user?.kar_kd_unit === '20';
  const isPODMenu = user?.kar_kd_jabat === '21' || user?.kar_kd_jabat === '30';

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const result = await authService.checkAuth();
      if (!result.authenticated || !result.user) {
        router.push('/login');
        return;
      }
      setUser(result.user);
      await loadUserData(result.user);
      getCurrentLocation();
    } catch (e) {
      console.error('Auth error:', e);
      setError('Gagal memeriksa autentikasi');
      setLoading(false);
    }
  };

  const loadUserData = async (userData: UserType) => {
    try {
      if (userData.kar_kd_unit) {
        const unitResponse = await api.getUnitData(userData.kar_kd_unit);
        if (unitResponse.success && unitResponse.data && unitResponse.data.length > 0) {
          const unitData = unitResponse.data[0];
          setUnit({
            ...unitData,
            latitude: parseFloat(unitData.latitude),
            longitude: parseFloat(unitData.longitude),
          });
        } else {
          setError('Data unit tidak ditemukan');
        }
      }

      try {
        const rotiq = await api.cekRotiqMobile(userData.kar_nik);
        if (rotiq?.success && rotiq.is_rotiq_mobile) {
          const units: RotiQUnit[] = (rotiq.units ?? []).map((u: any) => ({
            kd_unit: u.kd_unit,
            nm_unit: u.nm_unit,
            latitude: parseFloat(u.latitude),
            longitude: parseFloat(u.longitude),
          }));
          setRotiQUnits(units);
          setIsRotiQMobile(true);
          if (units.length > 0) {
            setSelectedRotiQUnit(units.find((u) => u.kd_unit === userData.kar_kd_unit) ?? units[0]);
          }
        } else {
          setIsRotiQMobile(false);
          setRotiQUnits([]);
          setSelectedRotiQUnit(null);
        }
      } catch (e) {
        console.error('Error cek RotiQ:', e);
      }

      if (userData.kar_nama) {
        const attendanceResponse = await api.getTodayAttendance(userData.kar_nama);
        if (attendanceResponse.success && Array.isArray(attendanceResponse.data)) {
          setSessions(attendanceResponse.data);
        } else {
          setSessions([]);
        }
      }

      if (userData.kar_kd_unit === '20') {
        try {
          const shiftResponse = await api.getShifts(userData.kar_nik);
          if (
            !shiftResponse.non_shift &&
            shiftResponse.success &&
            shiftResponse.data &&
            shiftResponse.data.length > 0
          ) {
            setShifts(shiftResponse.data);
            setSelectedShift(shiftResponse.default_shift || 1);
          } else {
            setShifts([]);
          }
        } catch (shiftError) {
          console.error('Error loading shifts:', shiftError);
          setShifts([]);
        }
      } else {
        setShifts([]);
      }

      try {
        const cuti = await api.getSisaCuti(userData.kar_nik);
        if (cuti?.success) setSisaCuti(cuti.sisa_cuti ?? 0);
      } catch (e) {
        console.error('Error sisa cuti:', e);
      }

      try {
        const role = await api.cekRoleApproval(userData.kar_nik);
        if (role?.success && role.is_approver) {
          const unitsArr: string[] = (role.kd_units ?? []).map((e: any) => e.toString());
          setIsApprover(true);
          setKdUnits(unitsArr);
          if (unitsArr.length > 0) {
            const pending = await api.getApprovalList({ kd_units: unitsArr.join(','), status: 'PENDING' });
            if (pending?.success && Array.isArray(pending.data)) {
              setPendingCount(pending.data.length);
            }
          }
        } else {
          setIsApprover(false);
          setKdUnits([]);
          setPendingCount(0);
        }
      } catch (e) {
        console.error('Error cek role:', e);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
      setError('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setIsRefreshingLocation(true);
    if (!navigator.geolocation) {
      toast.show('error', 'Browser Anda tidak mendukung geolokasi');
      setIsRefreshingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsRefreshingLocation(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        toast.show('error', 'Gagal mendapat lokasi. Pastikan izin lokasi aktif.');
        setIsRefreshingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleRotiQUnitChange = (unit: RotiQUnit) => {
    setSelectedRotiQUnit(unit);
    setUserLocation({ lat: unit.latitude, lng: unit.longitude });
  };

  const submitAbsensi = async (status: 1 | 2) => {
    if (!user || !unit) return;
    const effective = effectiveUnit;
    const distance = calculateDistance(userLocation.lat, userLocation.lng, effective.latitude, effective.longitude);
    if (distance >= 500) {
      toast.show('error', 'Anda berada di luar jangkauan 500 meter dari titik absen');
      return;
    }
    const isIn = status === 1;
    isIn ? setIsCheckingIn(true) : setIsCheckingOut(true);
    try {
      await api.submitAttendance({
        kar_nik: user.kar_nik,
        kd_cabang: user.kar_kd_unit,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString(),
        status_absen: status,
        shift: shifts.length > 0 ? selectedShift : undefined,
      });
      toast.show('success', isIn ? 'Check in berhasil' : 'Check out berhasil');
      await loadUserData(user);
    } catch (e: any) {
      const msg = e?.response?.data?.message || (isIn ? 'Check in gagal, coba lagi' : 'Check out gagal, coba lagi');
      toast.show('error', msg);
    } finally {
      isIn ? setIsCheckingIn(false) : setIsCheckingOut(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    checkAuth();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="text-center max-w-md w-full card p-8">
          <AlertCircle className="w-10 h-10 text-danger-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-ink mb-1">Terjadi kesalahan</h2>
          <p className="text-ink-soft mb-5">{error}</p>
          <button onClick={handleRetry} className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
            Coba lagi
          </button>
          <button onClick={handleLogout} className="w-full mt-2 text-danger-700 py-3 rounded-lg hover:bg-danger-50">
            Keluar
          </button>
        </div>
      </div>
    );
  }

  if (!user || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="text-center max-w-md w-full card p-8">
          <AlertCircle className="w-10 h-10 text-warning-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-ink mb-1">Data tidak lengkap</h2>
          <p className="text-ink-soft mb-5">Data karyawan atau unit tidak ditemukan</p>
          <button onClick={handleLogout} className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
            Kembali ke login
          </button>
        </div>
      </div>
    );
  }

  const effectiveUnit = isRotiQMobile && selectedRotiQUnit ? selectedRotiQUnit : unit;
  const distance = calculateDistance(userLocation.lat, userLocation.lng, effectiveUnit.latitude, effectiveUnit.longitude);
  const isWithinRange = distance <= 500;

  // Tampilan masuk/keluar mengikuti shift yang dipilih (unit 20); sesi terbuka lebih dulu
  const displaySession =
    isUnit20 && shifts.length > 0
      ? (sessions.find((s) => Number(s.shift) === selectedShift) ??
        sessions.find((s) => !s._OUT) ??
        null)
      : (sessions[0] ?? null);
  const checkInTime = displaySession?._IN;
  const checkOutTime = displaySession?._OUT;
  const hasIn = Boolean(checkInTime);
  const hasOut = Boolean(checkOutTime);
  const statusLabel = hasIn && hasOut ? 'Selesai' : hasIn ? 'Aktif' : 'Belum absen';

  const menuItems: MenuItem[] = [
    {
      label: 'Riwayat',
      desc: 'Riwayat absensi',
      to: '/history',
      icon: <ReceiptText className="w-5 h-5" />,
      gradient: 'from-primary-600 to-primary-700',
    },
    {
      label: 'Izin',
      desc: 'Ajukan izin',
      to: '/izin',
      icon: <CalendarClock className="w-5 h-5" />,
      gradient: 'from-danger-600 to-danger-700',
    },
    {
      label: 'Laporan',
      desc: 'Izin disetujui',
      to: '/laporan',
      icon: <FolderCheck className="w-5 h-5" />,
      gradient: 'from-success-600 to-success-700',
    },
    {
      label: 'Statistik',
      desc: 'Performa absen',
      to: '/statistik',
      icon: <BarChart3 className="w-5 h-5" />,
      gradient: 'from-[#6D28D9] to-[#5B21B6]',
    },
  ];

  if (isPODMenu) {
    menuItems.push({
      label: 'POD',
      desc: 'Proof of delivery',
      to: '/pod',
      icon: <Truck className="w-5 h-5" />,
      gradient: 'from-[#B45309] to-[#92400E]',
    });
  }

  if (isApprover) {
    menuItems.push({
      label: 'Persetujuan',
      desc: 'Izin bawahan',
      to: '/approval',
      icon: <CheckCircle2 className="w-5 h-5" />,
      gradient: 'from-[#0E7490] to-[#155E75]',
      badge: pendingCount > 0 ? pendingCount : undefined,
    });
  }

  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
        {/* Kartu profil + absensi (mirror Flutter) */}
        <section className="rounded-xl bg-gradient-to-br from-success-600 to-success-700 p-5 sm:p-6 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
              {(user.kar_nama || user.kar_nik || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">{user.kar_nama}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-xs bg-white/15 rounded-full px-2.5 py-0.5">{user.kar_kd_jabat ?? 'Karyawan'}</span>
                <span className="text-xs bg-white/15 rounded-full px-2.5 py-0.5">{unit.nm_unit}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <div className="text-center bg-white/15 rounded-lg px-3 py-2">
                <p className="text-2xl font-bold leading-none">{sisaCuti !== null ? sisaCuti : '--'}</p>
                <p className="text-[11px] text-white/80 mt-0.5">Sisa cuti</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-lg bg-white/15 text-white hover:bg-white/25"
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isRotiQMobile && rotiQUnits.length > 0 && (
            <div className="mt-4">
              <label className="text-xs text-white/80 flex items-center gap-1.5 mb-1.5">
                <Leaf className="w-3.5 h-3.5" /> Lokasi RotiQ absen
              </label>
              <select
                value={selectedRotiQUnit?.kd_unit ?? ''}
                onChange={(e) => {
                  const u = rotiQUnits.find((x) => x.kd_unit === e.target.value);
                  if (u) handleRotiQUnitChange(u);
                }}
                className="w-full px-3 py-2.5 rounded-lg border-0 text-sm text-ink bg-white"
              >
                {rotiQUnits.map((u) => (
                  <option key={u.kd_unit} value={u.kd_unit}>
                    {u.nm_unit}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isUnit20 && shifts.length > 0 && (
            <div className="mt-4">
              <label className="text-xs text-white/80 mb-1.5 block">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg border-0 text-sm text-ink bg-white"
              >
                {shifts.map((s) => (
                  <option key={s.kd_shift} value={s.kd_shift}>
                    Shift {s.kd_shift} ({s.nm_shift}) · {s.jam_mulai} - {s.jam_selesai}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-xs bg-white/15 rounded-full px-3 py-1">{statusLabel}</span>
            <button
              onClick={getCurrentLocation}
              disabled={isRefreshingLocation}
              className="flex items-center gap-1.5 text-xs text-white/85 hover:text-white disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLocation ? 'animate-spin' : ''}`} />
              Perbarui lokasi
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" /> Masuk
              </p>
              <p className="text-3xl font-bold mt-1">{jamSaja(checkInTime)}</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4">
              <p className="text-xs text-white/80 flex items-center gap-1.5">
                <LogOutIcon className="w-3.5 h-3.5" /> Keluar
              </p>
              <p className="text-3xl font-bold mt-1">{jamSaja(checkOutTime)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-white/80">
              {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance.toFixed(0)} m`} dari titik absen ·{' '}
              {isWithinRange ? 'dalam jangkauan' : 'di luar jangkauan'}
            </p>
            {!isWithinRange && (
              <span className="shrink-0 text-[11px] bg-white text-danger-700 rounded-full px-2.5 py-1 font-medium">
                Pergeseran
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => submitAbsensi(1)}
              disabled={hasIn || isCheckingIn}
              className={`flex items-center justify-center gap-2 min-h-12 rounded-lg font-semibold ${
                hasIn ? 'bg-white/30 text-white/70 cursor-not-allowed' : 'bg-white text-success-700 hover:bg-success-50'
              }`}
            >
              {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {hasIn ? 'Selesai' : 'Check In'}
            </button>
            <button
              onClick={() => submitAbsensi(2)}
              disabled={hasOut || isCheckingOut}
              className={`flex items-center justify-center gap-2 min-h-12 rounded-lg font-semibold ${
                hasOut ? 'bg-white/30 text-white/70 cursor-not-allowed' : 'bg-white text-warning-700 hover:bg-warning-50'
              }`}
            >
              {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOutIcon className="w-4 h-4" />}
              {hasOut ? 'Selesai' : 'Check Out'}
            </button>
          </div>
        </section>

        {/* Launchpad menu (mirror Flutter) */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {menuItems.map((m) => (
              <Link
                key={m.label}
                href={m.to}
                className={`relative rounded-xl bg-gradient-to-br ${m.gradient} p-4 text-white min-h-32 flex flex-col justify-between hover:opacity-95 active:scale-[0.98] transition shadow-soft`}
              >
                {m.badge && (
                  <span className="absolute top-3 right-3 rounded-full bg-white text-danger-600 text-xs font-bold px-2 py-0.5">
                    {m.badge > 99 ? '99+' : m.badge}
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">{m.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{m.label}</p>
                  <p className="text-[11px] text-white/80 leading-tight">{m.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Peta lokasi */}
        <section className="card p-5">
          <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" />
            Lokasi saat ini
          </h2>
          <LocationMap
            userLocation={userLocation}
            officeLocation={{ lat: effectiveUnit.latitude, lng: effectiveUnit.longitude }}
            rotiQLocation={
              isRotiQMobile && selectedRotiQUnit
                ? { lat: selectedRotiQUnit.latitude, lng: selectedRotiQUnit.longitude }
                : undefined
            }
            height="300px"
          />
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-soft">
            <span>
              Anda: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </span>
            <span className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              Titik absen: {effectiveUnit.latitude.toFixed(5)}, {effectiveUnit.longitude.toFixed(5)}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}