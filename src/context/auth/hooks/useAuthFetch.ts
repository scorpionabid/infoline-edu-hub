
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
      
      const userRole = Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles;
      
      const userData: FullUserData = {
        id: data.id,
        email: authUser.user?.email || data.email || '',
        full_name: data.full_name,
        name: data.full_name,
        role: userRole.role as UserRole,
        region_id: userRole.region_id,
        regionId: userRole.region_id,
        sector_id: userRole.sector_id,
        sectorId: userRole.sector_id,
        school_id: userRole.school_id,
        schoolId: userRole.school_id,
        phone: data.phone,
        position: data.position,
        language: data.language || 'az',
        avatar: data.avatar,
        status: data.status || 'active',
        lastLogin: data.last_login,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  return { fetchUserData };
};
