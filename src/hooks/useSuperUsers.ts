import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface SuperUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface UseSuperUsersResult {
  users: SuperUser[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching super users (using TanStack Query)
 * @returns {UseSuperUsersResult} The fetched super users, loading state and error
 */
export function useSuperUsers(): UseSuperUsersResult {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const fetchSuperUsers = async (): Promise<SuperUser[]> => {
    if (!isAuthenticated) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        user_roles!inner (
          role
        )
      `)
      .eq('user_roles.role', 'superadmin');

    if (error) {
      throw new Error(error.message);
    }

    // Transform data format to match expected interface
    return data?.map((item: any) => ({
      id: item.id,
      full_name: item.full_name,
      email: item.email,
      role: item.user_roles?.[0]?.role || 'superadmin'
    })) || [];
  };

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['superUsers'],
    queryFn: fetchSuperUsers,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    users,
    loading: isLoading,
    error: error instanceof Error ? error : null
  };
}
