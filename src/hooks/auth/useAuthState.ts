
import { useState } from 'react';
import { FullUserData } from '@/types/supabase';

export type AuthState = {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
};

/**
 * Auth state idarəetməsi üçün hook
 */
export const useAuthState = () => {
  // Auth state-i
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    session: null
  });
  
  // Xətaları təmizləmə
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };
  
  return {
    state,
    setState,
    clearError
  };
};
