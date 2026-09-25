import { api } from './api';

export interface User {
  kar_nik: string;
  kar_nama: string;
  kar_kd_unit: string;
  kar_kd_jabat?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthCheckResult {
  authenticated: boolean;
  user?: User;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private deviceKey = 'web_device_id';

  // Identitas browser (perangkat). Dibuat sekali, ikut semua panggilan auth.
  getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    let deviceId = window.localStorage.getItem(this.deviceKey);
    if (!deviceId) {
      deviceId =
        typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 12)}`;
      window.localStorage.setItem(this.deviceKey, deviceId);
    }
    return deviceId;
  }

  async login(kar_nik: string, password: string): Promise<AuthResult> {
    try {
      const data = await api.login(kar_nik, password, this.getDeviceId());

      if (data.success) {
        this.setToken(data.token);
        this.setUser(data.user);
        return { success: true, user: data.user };
      }

      this.clearAuth();
      return { success: false, error: data.message || 'Login gagal' };
    } catch (error: any) {
      this.clearAuth();
      console.error('Login error details:', error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        let errorMessage = 'Terjadi kesalahan pada server';

        if (status === 401) {
          errorMessage = 'NIK atau password salah';
        } else if (status === 403) {
          errorMessage = errorData?.message || 'Perangkat ini sudah terikat akun lain';
        } else if (status === 400) {
          errorMessage = errorData?.message || 'Data tidak valid';
        } else if (status === 404) {
          errorMessage = 'Endpoint API tidak ditemukan';
        } else if (status === 500) {
          errorMessage = 'Server sedang mengalami masalah';
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }

        return { success: false, error: errorMessage };
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
        return {
          success: false,
          error: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        };
      } else {
        console.error('Other error:', error.message);
        return {
          success: false,
          error: error.message || 'Terjadi kesalahan tidak diketahui',
        };
      }
    }
  }

  async checkAuth(): Promise<AuthCheckResult> {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      this.clearAuth();
      return { authenticated: false };
    }

    try {
      const data = await api.verifyToken(token, this.getDeviceId());

      if (data.success) {
        this.setUser(data.user);
        return { authenticated: true, user: data.user };
      }

      // Token mati (sesi dipakai perangkat lain / sudah logout) -> keluarkan
      this.clearAuth();
      return { authenticated: false };
    } catch (error) {
      console.error('Auth check failed:', error);
      // Kegagalan auth = tidak login. Tanpa fallback: perangkat yang dikick tidak bisa lolos lagi.
      this.clearAuth();
      return { authenticated: false };
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(this.userKey);
        if (!raw || raw === 'undefined' || raw === 'null') {
          return null;
        }
        return JSON.parse(raw);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.localStorage.removeItem(this.userKey);
        return null;
      }
    }
    return null;
  }

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(this.tokenKey);
      window.localStorage.removeItem(this.userKey);
    }
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    try {
      if (token) {
        await api.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }
}

export const authService = new AuthService();