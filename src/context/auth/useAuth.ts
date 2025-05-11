
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { useAuth2 } from '@/hooks/auth/useAuth2';

export const useAuth = () => {
  // Get context from AuthContext
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default useAuth;
