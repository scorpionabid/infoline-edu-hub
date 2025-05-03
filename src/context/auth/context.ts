
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the context with undefined default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => false,
  logout: async () => {},
  updateUser: async () => false,
  clearError: () => {},
});
