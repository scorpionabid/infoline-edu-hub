
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

// Add the missing fetchUserData function that useOptimizedUserList expects
export const fetchUserData = async (
  filters: any = {}, 
  page: number = 1, 
  limit: number = 20, 
  userRole: string = 'schooladmin', 
  regionId?: string, 
  sectorId?: string
) => {
  try {
    // For now, we'll use the existing fetchAllUsers and filter client-side
    const allUsers = await userFetchService.fetchAllUsers();
    
    // Apply filters
    let filteredUsers = allUsers;
    
    if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
      filteredUsers = filteredUsers.filter(user => filters.role!.includes(user.role));
    } else if (filters.role && typeof filters.role === 'string') {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }
    
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      filteredUsers = filteredUsers.filter(user => filters.status!.includes(user.status));
    } else if (filters.status && typeof filters.status === 'string') {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply role-based filtering
    if (userRole === 'regionadmin' && regionId) {
      filteredUsers = filteredUsers.filter(user => user.region_id === regionId);
    } else if (userRole === 'sectoradmin' && sectorId) {
      filteredUsers = filteredUsers.filter(user => user.sector_id === sectorId);
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);
    
    return {
      data: paginatedUsers,
      count: filteredUsers.length
    };
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    throw error;
  }
};
