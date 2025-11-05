'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Building2 } from 'lucide-react';
import LocationMap from '@/components/maps/LocationMap';
import AttendanceStatus from '@/components/attendance/AttendanceStatus';
import AttendanceButtons from '@/components/attendance/AttendanceButtons';
import { api } from '@/lib/api';
import { calculateDistance } from '@/lib/utils';
import { authService } from '@/lib/auth';
import { User as UserType, Unit } from '@/types';

interface TodayAttendance {
  checkInTime?: string;
  checkOutTime?: string;
}

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: -7.538982, lng: 110.844009 });
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance>({});
  const [loading, setLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  useEffect(() => {
    checkAuth();
    loadUserData();
    getCurrentLocation();
  }, []);

  const checkAuth = async () => {
    const result = await authService.checkAuth();
    
    if (!result.authenticated) {
      router.push('/login');
      return;
    }
    
    setUser(result.user);
  };

  const loadUserData = async () => {
    try {
      const userData = authService.getUser();
      
      if (userData && userData.kar_kd_unit) {
        const unitResponse = await api.getUnitData(userData.kar_kd_unit);
        if (unitResponse.success) {
          setUnit(unitResponse.data[0]);
        }
      }

      if (userData && userData.kar_nama) {
        const attendanceResponse = await api.getTodayAttendance(userData.kar_nama);
        if (attendanceResponse.success && attendanceResponse.data.length > 0) {
          const attendance = attendanceResponse.data[0];
          setTodayAttendance({
            checkInTime: attendance._IN,
            checkOutTime: attendance._OUT
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setIsRefreshingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda');
      setIsRefreshingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setIsRefreshingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diberikan.');
        setIsRefreshingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCheckIn = async () => {
    if (!user || !unit) return;
    
    setIsCheckingIn(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 19).replace('T', ' ');

      await api.submitAttendance({
        kar_nik: user.kar_nik,
        tanggal,
        kd_cabang: user.kar_kd_unit,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString()
      });

      await loadUserData();
      alert('Check In berhasil!');
    } catch (error) {
      console.error('Error during check in:', error);
      alert('Check In gagal. Silakan coba lagi.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !unit) return;
    
    setIsCheckingOut(true);
    try {
      const now = new Date();
      const tanggal = now.toISOString().slice(0, 19).replace('T', ' ');

      await api.submitAttendance({
        kar_nik: user.kar_nik,
        tanggal,
        kd_cabang: user.kar_kd_unit,
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString()
      });

      await loadUserData();
      alert('Check Out berhasil!');
    } catch (error) {
      console.error('Error during check out:', error);
      alert('Check Out gagal. Silakan coba lagi.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !unit) {
    return null;
  }

  const distance = unit ? calculateDistance(
    userLocation.lat,
    userLocation.lng,
    unit.latitude,
    unit.longitude
  ) : 0;

  const isWithinRange = distance <= 500;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistem Absensi</h1>
                <p className="text-sm text-gray-600">PT Bumi Sarana Maju</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user.kar_nama}</p>
                <p className="text-sm text-gray-600">{unit.nm_unit}</p>
              </div>
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Lokasi Saat Ini
              </h2>
              <LocationMap
                userLocation={userLocation}
                officeLocation={{ lat: unit.latitude, lng: unit.longitude }}
                height="400px"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Lokasi Anda</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Lokasi Kantor</span>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Riwayat Absensi
              </h2>
              <div className="text-center py-8 text-gray-500">
                <p>Fitur riwayat absensi akan segera hadir</p>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance Actions */}
          <div className="space-y-8">
            <AttendanceStatus
              checkInTime={todayAttendance.checkInTime}
              checkOutTime={todayAttendance.checkOutTime}
              distance={distance}
              isWithinRange={isWithinRange}
            />

            <AttendanceButtons
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onRefreshLocation={getCurrentLocation}
              isCheckingIn={isCheckingIn}
              isCheckingOut={isCheckingOut}
              isRefreshingLocation={isRefreshingLocation}
              hasCheckedIn={!!todayAttendance.checkInTime}
              hasCheckedOut={!!todayAttendance.checkOutTime}
              isWithinRange={isWithinRange}
            />

            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Karyawan
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium text-gray-900">{user.kar_nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIK</p>
                  <p className="font-medium text-gray-900">{user.kar_nik}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit</p>
                  <p className="font-medium text-gray-900">{unit.nm_unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Lokasi Kantor</p>
                  <p className="text-sm text-gray-900">
                    {unit.latitude}, {unit.longitude}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}