// ============================================================================
// İnfoLine Auth Hook - Unified Version
// ============================================================================
// Bu fayl zustand AuthStore-u daha rahat istifadə üçün wrap edir

import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading } from '@/hooks/auth/useAuthStore';

export const useAuth = () => {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  
  return {
    user,
    isAuthenticated,
    isLoading
  };
};

// Export default
export default useAuth;