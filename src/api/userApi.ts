
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserStatus } from '@/types/auth';

interface RawUserData {
  avatar: string;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  language: string;
  last_login: string;
  phone: string;
  position: string;
  status: string;
  updated_at: string;
  role?: string;
  avatar_url?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  last_sign_in_at?: string;
  name?: string;
  entityName?: string;
  notification_settings?: any;
  preferences?: any;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  name: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  status: UserStatus;
  last_login?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  entityName?: string;
  notification_settings?: any;
  preferences?: any;
}

const mapRawUserToUserData = (rawUser: RawUserData, userRole?: any): UserData => {
  return {
    id: rawUser.id,
    email: rawUser.email,
    full_name: rawUser.full_name,
    name: rawUser.full_name,
    role: (rawUser.role || userRole?.role || 'schooladmin') as UserRole,
    avatar: rawUser.avatar,
    avatar_url: rawUser.avatar,
    region_id: rawUser.region_id || userRole?.region_id,
    sector_id: rawUser.sector_id || userRole?.sector_id,
    school_id: rawUser.school_id || userRole?.school_id,
    phone: rawUser.phone,
    position: rawUser.position,
    language: rawUser.language,
    status: (rawUser.status as UserStatus) || 'active',
    last_login: rawUser.last_login,
    last_sign_in_at: rawUser.last_login,
    created_at: rawUser.created_at,
    updated_at: rawUser.updated_at,
    entityName: '',
    notification_settings: {},
    preferences: {}
  };
};

export const createUsers = async (usersData: Partial<UserData>[]): Promise<UserData[]> => {
  // First, create profiles
  const profilesData = usersData.map(user => ({
    id: user.id!,
    email: user.email!,
    full_name: user.full_name!,
    status: user.status || 'active',
    language: user.language || 'az'
  }));

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .insert(profilesData)
    .select();

  if (profileError) throw profileError;

  // Then, create user roles
  const rolesData = usersData.map(user => ({
    user_id: user.id!,
    role: user.role!,
    region_id: user.region_id,
    sector_id: user.sector_id,
    school_id: user.school_id
  }));

  const { data: roles, error: roleError } = await supabase
    .from('user_roles')
    .insert(rolesData)
    .select();

  if (roleError) throw roleError;

  // Return mapped user data
  return profiles.map((profile, index) => 
    mapRawUserToUserData(profile, roles[index])
  );
};

export const getUsers = async (
  options: {
    role?: UserRole[];
    region_id?: string;
    sector_id?: string;
    school_id?: string;
    status?: UserStatus[];
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ users: UserData[]; total: number }> => {
  try {
    const { data, error } = await supabase.rpc('get_filtered_users', {
      p_role: options.role,
      p_region_id: options.region_id,
      p_sector_id: options.sector_id,
      p_school_id: options.school_id,
      p_status: options.status,
      p_search: options.search,
      p_page: options.page || 1,
      p_limit: options.limit || 10
    });

    if (error) throw error;

    const users = (data || []).map((item: any) => {
      const userData = item.user_json;
      return mapRawUserToUserData(userData);
    });

    // Get total count
    const { data: countData, error: countError } = await supabase.rpc('get_filtered_users_count', {
      p_role: options.role,
      p_region_id: options.region_id,
      p_sector_id: options.sector_id,
      p_school_id: options.school_id,
      p_status: options.status,
      p_search: options.search
    });

    if (countError) throw countError;

    return {
      users,
      total: countData || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<UserData>): Promise<UserData> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: userData.full_name,
      email: userData.email,
      phone: userData.phone,
      position: userData.position,
      language: userData.language,
      status: userData.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return mapRawUserToUserData(data);
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
