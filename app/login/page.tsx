'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Lock } from 'lucide-react';
import { authService } from '@/lib/auth';

export default function Login() {
  const [karNik, setKarNik] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.directLogin(karNik, password);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login gagal');
      }
    } catch (err: any) {
      console.error('Login error:', err);
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
          <h2 className="text-3xl font-bold text-gray-900">GOTEN</h2>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                placeholder="Masukkan NIK Anda"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black"
                placeholder="Masukkan password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Memproses Login...' : 'Login'}
          </button>
        </form>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Gunakan NIK dan password Anda
          </p>
        </div>
      </div>
    </div>
  );
}
