'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
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
      const result = await authService.login(karNik, password);
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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 mb-4 shadow-soft">
            <Building2 className="w-5 h-5 text-white" />
            <span className="font-bold text-white">GOTEN</span>
          </div>
          <h1 className="text-xl font-bold text-ink">Masuk</h1>
          <p className="text-sm text-ink-soft mt-1">Sistem absensi PT Bumi Sarana Maju</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-danger-50 border border-danger-600/30 text-danger-700 px-3 py-2.5 text-sm">
              {error}
            </div>
          )}

          <label className="block">
            <span className="field-label">NIK Karyawan</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={karNik}
              onChange={(e) => setKarNik(e.target.value)}
              placeholder="Masukkan NIK"
              className="field"
            />
          </label>

          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="field"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 font-medium"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-soft">PT Bumi Sarana Maju</p>
      </div>
    </div>
  );
}