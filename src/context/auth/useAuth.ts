
import { useContext } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from '@/types/auth';

/**
 * Hook to access the Auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;
