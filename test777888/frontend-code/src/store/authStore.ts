import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  displayName: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

const TOKEN_KEY = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_TOKEN_KEY ?? 'auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  
  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
  },
  
  setUser: (user: User) => {
    set({ user });
  },
  
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));