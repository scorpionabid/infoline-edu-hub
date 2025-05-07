
import { useContext } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from '@/types/user'; 

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Contextə authenticated xassəsini əlavə et
  return {
    ...context,
    authenticated: context.isAuthenticated
  };
};

// Avtorizasiya olmayan halda xəta atır
export const useAuthSafe = () => {
  const auth = useAuth();
  
  if (!auth.user && !auth.loading) { 
    throw new Error('useAuthSafe must be used within an authenticated context and after loading is complete');
  }
  
  return auth;
};
