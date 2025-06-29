
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
      const _status: UserStatus = data.status === 'blocked' ? 'inactive' : 
                                 data.status === 'active' ? 'active' : 'inactive';

      return {
        ...data,
        // status
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
  },

  async getAssignableUsersForRegion(regionId: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 Calling getAssignableUsersForRegion with regionId:', regionId);
      
      const { data, error } = await supabase.rpc('get_assignable_users_for_region', {
        p_region_id: regionId
      });

      if (error) {
        console.error('❌ Supabase RPC Error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Successfully fetched assignable users:', {
        count: data?.length || 0,
        users: data?.slice(0, 3) // Show first 3 users for debugging
      });

      return data as FullUserData[];
    } catch (error) {
      console.error('❌ Error in getAssignableUsersForRegion:', error);
      throw error;
    }
  },

  // Backward compatibility aliases
  fetchAllUsers: function() { return this.getAllUsers(); },
  fetchUserById: function(userId: string) { return this.getUserById(userId); }
};

// Export individual functions for backward compatibility
export const getUsers = userFetchService.getAllUsers;
export const getUser = userFetchService.getUserById;
export const getAssignableUsersForRegion = userFetchService.getAssignableUsersForRegion;

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
    // For now, we'll use the existing getAllUsers and filter client-side
    const allUsers = await userFetchService.getAllUsers();
    
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
