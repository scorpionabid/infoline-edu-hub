
import { supabase } from '@/lib/supabase';
import { FullUserData, UserRole } from '@/types/auth';

export const useAuthFetch = () => {
  const fetchUserData = async (userId: string): Promise<FullUserData> => {
    try {
      // Get user data from profiles table with role information
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

      // Get auth user email
      const { data: authUser } = await supabase.auth.getUser();
      
      const userData: FullUserData = {
        id: data.id,
        email: authUser.user?.email || data.email || '',
        full_name: data.full_name,
        name: data.full_name,
        role: data.user_roles.role as UserRole,
        region_id: data.user_roles.region_id,
        regionId: data.user_roles.region_id,
        sector_id: data.user_roles.sector_id,
        sectorId: data.user_roles.sector_id,
        school_id: data.user_roles.school_id,
        schoolId: data.user_roles.school_id,
        phone: data.phone,
        position: data.position,
        language: data.language || 'az',
        avatar: data.avatar,
        status: data.status || 'active',
        last_login: data.last_login,
        lastLogin: data.last_login,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at
      };

      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  return { fetchUserData };
};
