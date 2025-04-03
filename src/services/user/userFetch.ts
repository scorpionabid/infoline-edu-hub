import { supabase } from '@/integrations/supabase/client';
import { UserFetchFilters, UsersResponse } from './types';

export const fetchUsers = async (
  page: number,
  pageSize: number,
  filters: UserFetchFilters = {}
): Promise<UsersResponse> => {
  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      status,
      last_login,
      created_at,
      updated_at,
      user_roles (
        role,
        region_id,
        sector_id,
        school_id
      )
    `,
      { count: 'estimated' }
    )
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters.role) {
    query = query.eq('user_roles.role', filters.role);
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

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.ilike('full_name', `%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  const users = data.map((userData: any) => {
    const roleData = userData.user_roles ? userData.user_roles[0] : null;

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      role: userData.role as unknown as string, // role tipini təhlükəsiz çevririk
      status: userData.status,
      regionId: userData.user_roles?.[0]?.region_id || null,
      sectorId: userData.user_roles?.[0]?.sector_id || null,
      schoolId: userData.user_roles?.[0]?.school_id || null,
      avatar: userData.avatar,
      language: userData.language,
      phone: userData.phone,
      position: userData.position,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      lastLogin: userData.last_login,
      twoFactorEnabled: userData.twoFactorEnabled,
      notificationSettings: userData.notificationSettings,
    };

    return user;
  });

  return {
    data: users,
    count: count || 0,
  };
};

export const getUserById = async (userId: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      status,
      last_login,
      created_at,
      updated_at,
      user_roles (
        role,
        region_id,
        sector_id,
        school_id
      )
    `
    )
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  const userData = data;
  const roleData = userData.user_roles ? userData.user_roles[0] : null;

  const user = {
    id: userData.id,
    email: userData.email,
    name: userData.full_name,
    role: userData.role as unknown as string,
    status: userData.status,
    regionId: userData.user_roles?.[0]?.region_id || null,
    sectorId: userData.user_roles?.[0]?.sector_id || null,
    schoolId: userData.user_roles?.[0]?.school_id || null,
    avatar: userData.avatar,
    language: userData.language,
    phone: userData.phone,
    position: userData.position,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    lastLogin: userData.last_login,
    twoFactorEnabled: userData.twoFactorEnabled,
    notificationSettings: userData.notificationSettings,
  };

  return user;
};

export const getUserByEmail = async (email: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      status,
      last_login,
      created_at,
      updated_at,
      user_roles (
        role,
        region_id,
        sector_id,
        school_id
      )
    `
    )
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const userData = data;
  const roleData = userData.user_roles ? userData.user_roles[0] : null;

  const user = {
    id: userData.id,
    email: userData.email,
    name: userData.full_name,
    role: userData.role as unknown as string,
    status: userData.status,
    regionId: userData.user_roles?.[0]?.region_id || null,
    sectorId: userData.user_roles?.[0]?.sector_id || null,
    schoolId: userData.user_roles?.[0]?.school_id || null,
    avatar: userData.avatar,
    language: userData.language,
    phone: userData.phone,
    position: userData.position,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    lastLogin: userData.last_login,
    twoFactorEnabled: userData.twoFactorEnabled,
    notificationSettings: userData.notificationSettings,
  };

  return user;
};
