
import { useContext } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from './types';

/**
 * Auth kontekst məlumatlarına əlçatanlıq təmin edən hook
 * @returns {AuthContextType} Auth kontekst məlumatları
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Təhlükəsiz useAuth versiyası - AuthProvider olmayan kontekstdə də işləyir
 * @returns {AuthContextType} Auth kontekst məlumatları və ya default dəyərlər
 */
export const useAuthSafe = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    // Default auth konteksti qaytarırıq
    return {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async () => false,
      logout: async () => {},
      updateUser: async () => false,
      clearError: () => {},
      refreshProfile: async () => null,
      signIn: async () => false,
      signOut: async () => {},
      createUser: async () => ({ success: false, data: null, error: 'AuthProvider not found' })
    };
  }
  
  return context;
};
