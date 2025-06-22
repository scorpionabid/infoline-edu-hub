
import { create } from 'zustand';

interface AuthState {
  isLoading: boolean;
  user: any;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  user: null,
  
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Mock auth implementation
      console.log('Signing in with:', email);
      set({ user: { email }, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ isLoading: true });
    try {
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));
