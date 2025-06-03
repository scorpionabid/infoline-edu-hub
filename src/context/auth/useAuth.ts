
import { useAuthStore } from '@/hooks/auth/useAuthStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return {
    user,
    isAuthenticated,
    isLoading: false
  };
};
