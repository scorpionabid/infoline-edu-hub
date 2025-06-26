
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/types/user';

export const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserData | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            role,
            region_id,
            sector_id,
            // school_id
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      const userRoles = Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles;

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: userRoles.role,
        region_id: userRoles.region_id,
        sector_id: userRoles.sector_id,
        school_id: userRoles.school_id,
        phone: data.phone,
        position: data.position,
        language: data.language,
        avatar: data.avatar,
        status: (data.status === 'active' || data.status === 'inactive') ? data.status : 'active',
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    },
    enabled: !!userId
  });
};
