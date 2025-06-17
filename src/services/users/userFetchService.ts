import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserStatus } from '@/types/user';

export const userFetchService = {
  async getAllUsers(): Promise<FullUserData[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      return data as FullUserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async getUserById(userId: string): Promise<FullUserData | null> {
    try {
      const { data } = await supabase.rpc('get_full_user_data', {
        user_id_param: userId
      });

      if (!data) return null;

      // Ensure status is properly typed
      const status: UserStatus = data.status === 'blocked' ? 'inactive' : 
                                 data.status === 'active' ? 'active' : 'inactive';

      return {
        ...data,
        status
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async getUsersByRole(role: string): Promise<FullUserData[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role);

      if (error) {
        throw error;
      }

      return data as FullUserData[];
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      return [];
    }
  },

  async getUsersByRegion(regionId: string): Promise<FullUserData[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('region_id', regionId);

      if (error) {
        throw error;
      }

      return data as FullUserData[];
    } catch (error) {
      console.error(`Error fetching users in region ${regionId}:`, error);
      return [];
    }
  },

  async getUsersBySector(sectorId: string): Promise<FullUserData[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('sector_id', sectorId);

      if (error) {
        throw error;
      }

      return data as FullUserData[];
    } catch (error) {
      console.error(`Error fetching users in sector ${sectorId}:`, error);
      return [];
    }
  },

  async getUsersBySchool(schoolId: string): Promise<FullUserData[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', schoolId);

      if (error) {
        throw error;
      }

      return data as FullUserData[];
    } catch (error) {
      console.error(`Error fetching users in school ${schoolId}:`, error);
      return [];
    }
  }
};
