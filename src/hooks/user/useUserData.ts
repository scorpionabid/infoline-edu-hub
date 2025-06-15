
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
            school_id
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.user_roles.role,
        region_id: data.user_roles.region_id,
        sector_id: data.user_roles.sector_id,
        school_id: data.user_roles.school_id,
        phone: data.phone,
        position: data.position,
        language: data.language,
        avatar: data.avatar,
        status: data.status,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    },
    enabled: !!userId
  });
};
