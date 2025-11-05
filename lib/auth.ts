import { api } from './api';

export interface User {
  kar_nik: string;
  kar_nama: string;
  kar_kd_unit: string;
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

  // ✅ METHOD UNTUK DIRECT LOGIN (NIK + OTP)
  async directLogin(kar_nik: string, otp: string, browser_info: any): Promise<AuthResult> {
    try {
      const data = await api.verifyOTPLogin(kar_nik, otp, browser_info);
      
      if (data.success) {
        this.setToken(data.token);
        this.setUser(data.user);
        return { success: true, user: data.user };
      } else {
        this.clearAuth();
        return { success: false, error: data.message };
      }
    } catch (error) {
      this.clearAuth();
      return { success: false, error: 'Network error' };
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
      const data = await api.verifyToken(token);

      if (data.success) {
        this.setUser(data.user);
        return { authenticated: true, user: data.user };
      } else {
        this.clearAuth();
        return { authenticated: false };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return { authenticated: true, user: this.getUser() as User };
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }
}

export const authService = new AuthService();