import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: { name: string; role: string; email: string } | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  requestOtp: (email: string) => Promise<{ simulatedOtp: string } | null>;
  verifyOtp: (email: string, otp: string) => Promise<{ resetToken: string } | null>;
  resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isCheckingAuth: true,
  user: null,
  checkAuth: async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        set({ isAuthenticated: true, user: data.user, isCheckingAuth: false });
      } else {
        set({ isCheckingAuth: false });
      }
    } catch (e) {
      console.error('Session check failed', e);
      set({ isCheckingAuth: false });
    }
  },
  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ isAuthenticated: true, user: data.user });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  logout: async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      set({ isAuthenticated: false, user: null });
    } catch (e) {
      console.error(e);
    }
  },
  requestOtp: async (email: string) => {
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        return { simulatedOtp: data.simulatedOtp };
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  verifyOtp: async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (res.ok) {
        const data = await res.json();
        return { resetToken: data.resetToken };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  resetPassword: async (email: string, resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}));
