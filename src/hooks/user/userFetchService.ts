
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/user'; // Use user types consistently

interface UserRole {
  id?: string;
  user_id: string;
  role: string | null;
  region_id: string | null;
  sector_id: string | null;
  school_id: string | null;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export const userFetchService = {
  async fetchAllUsers(includeDeleted: boolean = false): Promise<FullUserData[]> {
    try {
      console.log('🔄 Fetching all users with enhanced strategy');
      
      // Step 1: Fetch all profiles (RLS will filter automatically)
      // Filter based on deletion status
      // includeDeleted=true: only soft-deleted users
      // includeDeleted=false: only active users (default behavior)
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          position,
          language,
          avatar,
          status,
          last_login,
          created_at,
          updated_at,
          deleted_at
        `);
      
      if (includeDeleted) {
        query = query.not('deleted_at', 'is', null); // Only soft-deleted users
      } else {
        query = query.is('deleted_at', null); // Only non-deleted users  
      }
      
      const { data: profiles, error: profilesError } = await query
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profiles || profiles.length === 0) {
        console.warn('⚠️ No profiles returned - this might be an RLS issue');
        return [];
      }
      
      console.log(`📈 Fetched ${profiles.length} profiles from RLS-filtered query`);
      
      // Step 2: Fetch all user roles that we can see
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        // Continue without roles rather than failing completely
      }
      
      console.log(`📈 Fetched ${userRoles?.length || 0} user roles`);
      
      // Step 3: Create a map of user roles by user_id for faster lookup
      const userRolesMap = new Map();
      userRoles?.forEach(role => {
        userRolesMap.set(role.user_id, role);
      });
      
      // Step 4: Combine the data with enhanced logging
      const combinedUsers = profiles.map(profile => {
        // Find matching user role by user id
        const userRole = userRolesMap.get(profile.id) || {};
        
        const combinedUser = {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          name: profile.full_name,
          role: userRole.role || null,
          region_id: userRole.region_id || null,
          sector_id: userRole.sector_id || null,
          school_id: userRole.school_id || null,
          phone: profile.phone,
          position: profile.position,
          language: profile.language,
          avatar: profile.avatar,
          status: profile.status || 'active', // Default to active if not set
          last_login: profile.last_login,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
        
        // Debug log for specific roles
        if (userRole.role === 'sectoradmin') {
          console.log('🎯 Found sectoradmin user:', {
            name: profile.full_name,
            email: profile.email,
            role: userRole.role,
            sector_id: userRole.sector_id,
            region_id: userRole.region_id
          });
        }
        
        return combinedUser;
      });
      
      // Debug: Count users by role
      const roleCounts = combinedUsers.reduce((counts, user) => {
        const role = user.role || 'no_role';
        counts[role] = (counts[role] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      console.log('📊 User role distribution:', roleCounts);
      console.log(`✅ Successfully fetched and combined ${combinedUsers.length} users`);
      
      return combinedUsers;
    } catch (error) {
      console.error('❌ Error in fetchAllUsers:', error);
      throw error;
    }
  },

  async fetchUserById(userId: string): Promise<FullUserData | null> {
    try {
      // Step 1: Fetch profile by ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile by ID:', profileError);
        return null;
      }

      if (!profile) return null;
      
      // Step 2: Fetch user role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError) {
        console.error('Error fetching user role by user ID:', roleError);
        // Continue anyway, we might have a profile without a role
      }
      
      // Step 3: Combine the data
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        name: profile.full_name,
        role: userRole?.role || null,
        region_id: userRole?.region_id || null,
        sector_id: userRole?.sector_id || null,
        school_id: userRole?.school_id || null,
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

// Export individual functions for backward compatibility
export const getUsers = userFetchService.fetchAllUsers;
export const getUser = userFetchService.fetchUserById;

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
