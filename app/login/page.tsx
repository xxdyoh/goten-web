'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { api } from '@/lib/api';
import { getBrowserInfo } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [kar_nik, setKarNik] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'nik' | 'otp'>('nik');

  const handleGenerateOTP = async () => {
    if (!kar_nik.trim()) {
      setError('NIK harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.generateOTP(kar_nik);

      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'Gagal generate OTP');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!otp.trim()) {
      setError('OTP harus diisi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const browser_info = getBrowserInfo();
      const result = await authService.login(kar_nik, otp, browser_info);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (error) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistem Absensi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            PT Bumi Sarana Maju
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {step === 'nik' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="kar_nik" className="block text-sm font-medium text-gray-700">
                  NIK
                </label>
                <input
                  id="kar_nik"
                  name="kar_nik"
                  type="text"
                  required
                  value={kar_nik}
                  onChange={(e) => setKarNik(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Masukkan NIK"
                />
              </div>
              
              <button
                onClick={handleGenerateOTP}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Generating OTP...' : 'Generate OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Masukkan OTP"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setStep('nik')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}