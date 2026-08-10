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

  async directLogin(kar_nik: string, password: string): Promise<AuthResult> {
  try {
    const data = await api.login(kar_nik, password);
    
    if (data.success) {
      this.setToken(data.token);
      this.setUser(data.user);
      return { success: true, user: data.user };
    } else {
      this.clearAuth();
      // Jika backend mengembalikan error message
      return { 
        success: false, 
        error: data.message || 'Login gagal' 
      };
    }
  } catch (error: any) {
    this.clearAuth();
    
    console.error('Login error details:', error);
    
    // Cek jika error dari axios response (backend error)
    if (error.response) {
      // Backend merespon dengan status error (400, 401, 500, dll)
      const status = error.response.status;
      const errorData = error.response.data;
      
      let errorMessage = 'Terjadi kesalahan pada server';
      
      if (status === 401) {
        errorMessage = 'NIK atau OTP salah';
      } else if (status === 400) {
        errorMessage = errorData.message || 'Data tidak valid';
      } else if (status === 404) {
        errorMessage = 'Endpoint API tidak ditemukan';
      } else if (status === 500) {
        errorMessage = 'Server sedang mengalami masalah';
      } else if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } 
    // Cek jika error dari request (network error)
    else if (error.request) {
      // Request dikirim tapi tidak ada response (network error)
      console.error('Network error - No response received:', error.request);
      return { 
        success: false, 
        error: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
      };
    } 
    // Error lainnya
    else {
      console.error('Other error:', error.message);
      return { 
        success: false, 
        error: error.message || 'Terjadi kesalahan tidak diketahui' 
      };
    }
  }
}

  async checkAuth(): Promise<AuthCheckResult> {
    const token = this.getToken();
    const user = this.getUser();

    console.log('🔐 Check Auth - Token:', token, 'User:', user);

    if (!token || !user) {
      console.log('❌ Auth failed: No token or user');
      this.clearAuth();
      return { authenticated: false };
    }

    try {
      const data = await api.verifyToken(token);

      if (data.success) {
        console.log('✅ Token valid, user:', data.user);
        this.setUser(data.user);
        return { authenticated: true, user: data.user };
      } else {
        console.log('❌ Token invalid');
        this.clearAuth();
        return { authenticated: false };
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Fallback: check if we have valid user data
      if (user) {
        console.log('⚠️ Using fallback auth with local user data');
        return { authenticated: true, user: user };
      } else {
        this.clearAuth();
        return { authenticated: false };
      }
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      console.log('💾 Token saved:', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.tokenKey);
      console.log('🔑 Token retrieved:', token);
      return token;
    }
    return null;
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      console.log('👤 User saved:', user);
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem(this.userKey);
        console.log('📥 Raw user data from localStorage:', userData);
        
        if (!userData || userData === 'undefined' || userData === 'null') {
          console.log('❌ No valid user data found');
          return null;
        }
        
        const parsedUser = JSON.parse(userData);
        console.log('✅ User parsed successfully:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem(this.userKey);
        return null;
      }
    }
    return null;
  }

  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('🗑️ Auth data cleared');
    }
  }

  async logout(): Promise<void> {
    try {
      // Skip backend logout if endpoint doesn't exist (404 error)
      console.log('🚪 Logging out...');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }
}

// ✅ HANYA SATU EXPORT INI
export const authService = new AuthService();