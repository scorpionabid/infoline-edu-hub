import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';
import { useAuthStore } from './useAuthStore';
import { UserStatus } from '@/types/user';

interface AuthFetchResult {
  loading: boolean;
  error: Error | null;
  fetchData: <T>(
    fn: (supabase: any) => Promise<T>,
    setData: (data: T) => void
  ) => Promise<void>;
}

export const useAuthFetch = (): AuthFetchResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const fetchData = useCallback(
    async <T>(
      fn: (supabase: any) => Promise<T>,
      setData: (data: T) => void
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(supabase);
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const processUserData = (userData: any) => {
    return {
      ...userData,
      status: (userData.status as UserStatus) || 'active',
      full_name: userData.full_name || `${userData.name || ''} ${userData.surname || ''}`.trim(),
      role: userData.role || 'user',
      language: userData.language || 'az',
    };
  };

  return {
    loading,
    error,
    fetchData,
  };
};
