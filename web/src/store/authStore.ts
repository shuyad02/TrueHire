import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email?: string;
  role: string;
  isVerified?: boolean;
  oauthProvider?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (token, user) => {
        // Store in cookies so Next.js middleware can read them
        Cookies.set('truehire_token', token, { expires: 7, sameSite: 'lax' });
        Cookies.set('truehire_role', user.role, { expires: 7, sameSite: 'lax' });
        set({ token, user });
      },

      logout: () => {
        Cookies.remove('truehire_token');
        Cookies.remove('truehire_role');
        set({ token: null, user: null });
        window.location.href = '/login';
      },
    }),
    {
      name: 'truehire-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// API helper with automatic auth header
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = Cookies.get('truehire_token');
  
  // Don't set Content-Type for FormData (browser sets multipart/form-data with boundary automatically)
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    Cookies.remove('truehire_token');
    Cookies.remove('truehire_role');
    window.location.href = '/login';
  }
  return res;
};
