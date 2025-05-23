/**
 * DEPRECATED: Bu hook artıq hooks/auth/useAuth.ts ilə əvəz edilib
 * Bu, əvvəlki import yollarının işləməsini təmin etmək üçün bir körpüdür
 */

import { useAuth as NewUseAuth } from '@/hooks/auth/useAuth';
import { AuthContextType } from '@/types/auth';

/**
 * Hook to access the Auth context
 * 
 * @deprecated Bu hook hooks/auth/useAuth.ts ilə əvəz edilib
 */
export function useAuth(): AuthContextType {
  return NewUseAuth() as any; // as any type uyğunluğunu təmin etmək üçün
}

export default useAuth;
