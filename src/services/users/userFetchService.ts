
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserStatus } from '@/types/user';

export const userFetchService = {
  async getAllUsers(): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getAllUsers - Starting fetch');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ userFetchService.getAllUsers - Error:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ userFetchService.getAllUsers - No data returned');
        return [];
      }

      console.log('✅ userFetchService.getAllUsers - Success:', data.length, 'users');
      return data as FullUserData[];
    } catch (error) {
      console.error('❌ userFetchService.getAllUsers - Exception:', error);
      return [];
    }
  },

  async getUserById(userId: string): Promise<FullUserData | null> {
    try {
      console.log('🔍 userFetchService.getUserById - Fetching user:', userId);
      
      const { data } = await supabase.rpc('get_full_user_data', {
        user_id_param: userId
      });

      if (!data) {
        console.log('⚠️ userFetchService.getUserById - No user found');
        return null;
      }

      // Ensure status is properly typed
      const status: UserStatus = data.status === 'blocked' ? 'inactive' : 
                                 data.status === 'active' ? 'active' : 'inactive';

      console.log('✅ userFetchService.getUserById - Success:', data.full_name);
      return { ...data, status };
    } catch (error) {
      console.error('❌ userFetchService.getUserById - Error:', error);
      return null;
    }
  },

  async getUsersByRole(role: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getUsersByRole - Fetching users with role:', role);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ userFetchService.getUsersByRole - Error:', error);
        throw error;
      }

      console.log('✅ userFetchService.getUsersByRole - Success:', data?.length || 0, 'users');
      return data as FullUserData[] || [];
    } catch (error) {
      console.error('❌ userFetchService.getUsersByRole - Exception:', error);
      return [];
    }
  },

  async getUsersByRegion(regionId: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getUsersByRegion - Fetching users in region:', regionId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('region_id', regionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ userFetchService.getUsersByRegion - Error:', error);
        throw error;
      }

      console.log('✅ userFetchService.getUsersByRegion - Success:', data?.length || 0, 'users');
      return data as FullUserData[] || [];
    } catch (error) {
      console.error('❌ userFetchService.getUsersByRegion - Exception:', error);
      return [];
    }
  },

  async getUsersBySector(sectorId: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getUsersBySector - Fetching users in sector:', sectorId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('sector_id', sectorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ userFetchService.getUsersBySector - Error:', error);
        throw error;
      }

      console.log('✅ userFetchService.getUsersBySector - Success:', data?.length || 0, 'users');
      return data as FullUserData[] || [];
    } catch (error) {
      console.error('❌ userFetchService.getUsersBySector - Exception:', error);
      return [];
    }
  },

  async getUsersBySchool(schoolId: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getUsersBySchool - Fetching users in school:', schoolId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ userFetchService.getUsersBySchool - Error:', error);
        throw error;
      }

      console.log('✅ userFetchService.getUsersBySchool - Success:', data?.length || 0, 'users');
      return data as FullUserData[] || [];
    } catch (error) {
      console.error('❌ userFetchService.getUsersBySchool - Exception:', error);
      return [];
    }
  },

  async getAssignableUsersForRegion(regionId: string): Promise<FullUserData[]> {
    try {
      console.log('🔍 userFetchService.getAssignableUsersForRegion - Calling RPC with regionId:', regionId);
      
      const { data, error } = await supabase.rpc('get_assignable_users_for_region', {
        p_region_id: regionId
      });

      if (error) {
        console.error('❌ userFetchService.getAssignableUsersForRegion - RPC Error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.log('⚠️ userFetchService.getAssignableUsersForRegion - No data returned');
        return [];
      }

      console.log('✅ userFetchService.getAssignableUsersForRegion - RPC Success:', {
        count: data.length,
        regionId,
        sampleUsers: data.slice(0, 3).map((u: any) => ({
          id: u.id,
          name: u.full_name,
          email: u.email,
          role: u.role
        }))
      });

      return data as FullUserData[];
    } catch (error) {
      console.error('❌ userFetchService.getAssignableUsersForRegion - Exception:', error);
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
