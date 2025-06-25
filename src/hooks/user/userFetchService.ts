
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/auth';

export const userFetchService = {
  async fetchAllUsers(): Promise<FullUserData[]> {
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
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
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
        updated_at: profile.updated_at
      }));
    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
      throw error;
    }
  },

  async fetchUserById(userId: string): Promise<FullUserData | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      if (!profile) return null;

      return {
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
        updated_at: profile.updated_at
      };
    } catch (error) {
      console.error('Error in fetchUserById:', error);
      return null;
    }
  }
};
