
import { create } from 'zustand';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setUser: (user: FullUserData | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setError: (error: string | null) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  setSession: (session) => set({ 
    session,
    isAuthenticated: !!session && !!session.user
  }),
  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user
  }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setError: (error) => set({ error }),
  resetAuth: () => set({ 
    user: null, 
    session: null, 
    isAuthenticated: false,
    error: null
  }),
}));
