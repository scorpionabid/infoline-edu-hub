
import { createContext } from 'react';
import { AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => ({ error: 'Not implemented' }),
  signOut: async () => {},
  logOut: async () => {},
  updatePassword: async () => ({ error: 'Not implemented' }),
  updateProfile: async () => ({ error: 'Not implemented' }),
  isAuthenticated: false,
  session: null
});
