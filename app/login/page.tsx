'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Smartphone } from 'lucide-react';
import { authService } from '@/lib/auth';
import { getBrowserInfo } from '@/lib/utils';

export default function Login() {
  const [karNik, setKarNik] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const browserInfo = getBrowserInfo();
      
      // ✅ GUNAKAN AUTH SERVICE UNTUK LOGIN
      const result = await authService.directLogin(karNik, otp, browserInfo);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sistem Absensi</h2>
          <p className="mt-2 text-gray-600">PT Bumi Sarana Maju</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
            <Smartphone className="w-4 h-4" />
            <span>Gunakan OTP dari Zoro App</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="karNik" className="block text-sm font-medium text-gray-700 mb-2">
                NIK Karyawan
              </label>
              <input
                id="karNik"
                type="text"
                required
                value={karNik}
                onChange={(e) => setKarNik(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan NIK Anda"
              />
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
                {timeLeft > 0 && (
                  <span className="ml-2 text-orange-600 font-semibold">
                    ({timeLeft}s)
                  </span>
                )}
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
                placeholder="000000"
              />
              <p className="mt-1 text-sm text-gray-500">
                6 digit OTP dari Zoro App (expired 1 menit)
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Memproses Login...' : 'Masuk ke Sistem'}
          </button>
        </form>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Hubungi tim IT untuk mendapatkan OTP</p>
        </div>
      </div>
    </div>
  );
}