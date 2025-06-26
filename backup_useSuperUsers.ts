import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user';

/**
 * Hook to fetch and filter superadmin users
 * Used in RegionAdminDialog for assigning admins
 */
export const useSuperUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['superusers'],
    queryFn: async (): Promise<FullUserData[]> => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            role,
            region_id,
            sector_id,
            school_id,
            phone,
            position,
            language,
            avatar,
            status,
            last_login,
            created_at
          `)
          .eq('role', 'superadmin')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching super users:', error);
          throw error;
        }

        return profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          name: profile.full_name,
          role: profile.role,
          region_id: profile.region_id,
          sector_id: profile.sector_id,
          school_id: profile.school_id,
          phone: profile.phone,
          position: profile.position,
          language: profile.language,
          avatar: profile.avatar,
          status: profile.status,
          last_login: profile.last_login,
          created_at: profile.created_at,
          updated_at: null // Şablon uyğunluğu üçün əlavə edilib
        }));
      } catch (error) {
        console.error('Error in useSuperUsers hook:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // RegionAdminDialog.tsx-də istifadə olunan formatda interfeys təmin edirik
  return {
    users: data || [],
    loading: isLoading,
    error: error
  };
};
