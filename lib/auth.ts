import { api } from './api';

class AuthService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'user_data';
  }

  // Login method
  async login(kar_nik, otp, browser_info) {
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

  // Check auth status - PERMANENT SESSION
  async checkAuth() {
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
      return { authenticated: true, user: this.getUser() };
    }
  }

  // Helper methods
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  // Logout
  async logout() {
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