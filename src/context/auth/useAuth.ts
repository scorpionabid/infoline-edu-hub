
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
