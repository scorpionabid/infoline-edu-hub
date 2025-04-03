
import { supabase } from '@/integrations/supabase/client';
import { UserFetchFilters, UsersResponse } from './types';

export const fetchUsers = async (
  filters: UserFetchFilters = {},
  pagination: { page: number; pageSize: number }
): Promise<UsersResponse> => {
  const { page, pageSize } = pagination;
  
  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      status,
      avatar,
      phone,
      position,
      language,
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
    const roleData = userData.user_roles && userData.user_roles.length > 0 
      ? userData.user_roles[0] 
      : { role: 'schooladmin', region_id: null, sector_id: null, school_id: null };
    
    // Typescript xətalarını həll etmək üçün yoxlamaları gücləndirilmiş şəkildə yazırıq
    const role = typeof roleData === 'object' && roleData !== null ? roleData.role || 'schooladmin' : 'schooladmin';
    const regionId = typeof roleData === 'object' && roleData !== null ? roleData.region_id : null;
    const sectorId = typeof roleData === 'object' && roleData !== null ? roleData.sector_id : null;
    const schoolId = typeof roleData === 'object' && roleData !== null ? roleData.school_id : null;
    
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.full_name,
      full_name: userData.full_name,
      role: role,
      status: userData.status,
      regionId: regionId,
      sectorId: sectorId,
      schoolId: schoolId,
      region_id: regionId,
      sector_id: sectorId,
      school_id: schoolId,
      avatar: userData.avatar,
      language: userData.language,
      phone: userData.phone,
      position: userData.position,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      lastLogin: userData.last_login,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login: userData.last_login,
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      },
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
      avatar,
      phone,
      position,
      language,
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
  const roleData = userData.user_roles && userData.user_roles.length > 0 
    ? userData.user_roles[0] 
    : { role: 'schooladmin', region_id: null, sector_id: null, school_id: null };

  // Burada da tip yoxlamalarını gücləndirilmiş şəkildə yazmaq lazımdır
  const role = typeof roleData === 'object' && roleData !== null ? roleData.role || 'schooladmin' : 'schooladmin';
  const regionId = typeof roleData === 'object' && roleData !== null ? roleData.region_id : null;
  const sectorId = typeof roleData === 'object' && roleData !== null ? roleData.sector_id : null;
  const schoolId = typeof roleData === 'object' && roleData !== null ? roleData.school_id : null;
  
  const user = {
    id: userData.id,
    email: userData.email,
    name: userData.full_name,
    full_name: userData.full_name,
    role: role,
    status: userData.status,
    regionId: regionId,
    sectorId: sectorId,
    schoolId: schoolId,
    region_id: regionId,
    sector_id: sectorId,
    school_id: schoolId,
    avatar: userData.avatar,
    language: userData.language,
    phone: userData.phone,
    position: userData.position,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    lastLogin: userData.last_login,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    },
  };

  return user;
};

export const getUser = getUserById;

export const getUserByEmail = async (email: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      email,
      full_name,
      status,
      avatar,
      phone, 
      position,
      language,
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
  const roleData = userData.user_roles && userData.user_roles.length > 0 
    ? userData.user_roles[0] 
    : { role: 'schooladmin', region_id: null, sector_id: null, school_id: null };

  // Bu dəyişənlər artıq obyekt kimi yoxlanır
  const role = typeof roleData === 'object' && roleData !== null ? roleData.role || 'schooladmin' : 'schooladmin';
  const regionId = typeof roleData === 'object' && roleData !== null ? roleData.region_id : null;
  const sectorId = typeof roleData === 'object' && roleData !== null ? roleData.sector_id : null;
  const schoolId = typeof roleData === 'object' && roleData !== null ? roleData.school_id : null;

  const user = {
    id: userData.id,
    email: userData.email,
    name: userData.full_name,
    full_name: userData.full_name,
    role: role,
    status: userData.status,
    regionId: regionId,
    sectorId: sectorId,
    schoolId: schoolId,
    region_id: regionId,
    sector_id: sectorId,
    school_id: schoolId,
    avatar: userData.avatar,
    language: userData.language,
    phone: userData.phone,
    position: userData.position,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    lastLogin: userData.last_login,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    last_login: userData.last_login,
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    },
  };

  return user;
};
