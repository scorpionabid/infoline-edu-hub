
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserFilter } from '@/types/user';

interface EntityDisplay {
  region?: string;
  sector?: string;  
  school?: string;
}

export const getEntityDisplay = (userData: any): EntityDisplay | string | null => {
  // Return display name based on role
  const role = userData.role;
  
  if (role === 'regionadmin' && userData.region_name) {
    return userData.region_name;
  }
  
  if (role === 'sectoradmin' && userData.sector_name) {
    return userData.sector_name;
  }
  
  if (role === 'schooladmin' && userData.school_name) {
    return userData.school_name;
  }
  
  return null;
};

export const buildUserQuery = (filters: UserFilter, userRole: string, regionId?: string, sectorId?: string) => {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles!inner(
        role,
        region_id,
        sector_id,
        school_id
      )
    `, { count: 'exact' });

  // Apply role-based restrictions
  if (userRole === 'regionadmin' && regionId) {
    query = query.eq('user_roles.region_id', regionId);
  } else if (userRole === 'sectoradmin' && sectorId) {
    query = query.eq('user_roles.sector_id', sectorId);
  }

  // Apply filters - handle both string and array types
  if (filters.role) {
    if (Array.isArray(filters.role)) {
      if (filters.role.length > 0) {
        query = query.in('user_roles.role', filters.role);
      }
    } else if (filters.role) {
      query = query.eq('user_roles.role', filters.role);
    }
  }

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      if (filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
    } else if (filters.status) {
      query = query.eq('status', filters.status);
    }
  }

  if (filters.region_id) {
    query = query.eq('user_roles.region_id', filters.region_id);
  }

  if (filters.sector_id) {
    query = query.eq('user_roles.sector_id', filters.sector_id);
  }

  if (filters.school_id) {
    query = query.eq('user_roles.school_id', filters.school_id);
  }

  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  return query;
};

export const transformUserData = (item: any): FullUserData => {
  const userRole = item.user_roles;
  
  return {
    id: item.id,
    email: item.email,
    fullName: item.full_name || '',
    full_name: item.full_name || '',
    name: item.full_name || '',
    role: userRole?.role || 'user',
    region_id: userRole?.region_id,
    sector_id: userRole?.sector_id,
    school_id: userRole?.school_id,
    regionId: userRole?.region_id,
    sectorId: userRole?.sector_id,
    schoolId: userRole?.school_id,
    phone: item.phone || '',
    position: item.position || '',
    language: item.language || 'az',
    avatar: item.avatar || '',
    avatar_url: item.avatar || '',
    status: item.status || 'active',
    last_login: item.last_login,
    last_sign_in_at: item.last_login,
    created_at: item.created_at,
    updated_at: item.updated_at,
    preferences: {},
    region_name: item.region_name,
    sector_name: item.sector_name,
    school_name: item.school_name,
    entityName: getEntityDisplay(item)
  };
};

export const createMockUserData = (): FullUserData => {
  return {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    full_name: 'Test User',
    role: 'user',
    region_id: null,
    sector_id: null,
    school_id: null,
    phone: '',
    position: '',
    language: 'az',
    avatar: '',
    status: 'active',
    last_login: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminEntity: null
  } as FullUserData;
};

export const fetchUserData = async (filters: UserFilter, page: number, limit: number, userRole: string, regionId?: string, sectorId?: string): Promise<{ data: FullUserData[], count: number }> => {
  try {
    console.log('Fetching users with role:', userRole, 'regionId:', regionId, 'sectorId:', sectorId);

    const query = buildUserQuery(filters, userRole, regionId, sectorId);
    
    const offset = (page - 1) * limit;
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedUsers = (data || []).map(transformUserData);

    return {
      data: transformedUsers,
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Return mock data on error
    return {
      data: [createMockUserData()],
      count: 1
    };
  }
};
