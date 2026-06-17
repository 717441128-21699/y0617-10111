import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../../shared/types';
import { authApi } from '../lib/api';

interface RegisterData {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  company?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  setCurrentUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email: string, password: string): Promise<boolean> => {
        const response = await authApi.login({ email, password });
        if (response.success && response.data) {
          set({
            user: response.data.user,
            token: response.data.token,
          });
          return true;
        }
        return false;
      },

      logout: (): void => {
        authApi.logout();
        set({
          user: null,
          token: null,
        });
      },

      register: async (data: RegisterData): Promise<boolean> => {
        const response = await authApi.register(data);
        if (response.success && response.data) {
          set({
            user: response.data.user,
            token: response.data.token,
          });
          return true;
        }
        return false;
      },

      setCurrentUser: (user: User): void => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export const useIsAuthenticated = (): boolean => {
  return useAuthStore((state) => !!state.token);
};
