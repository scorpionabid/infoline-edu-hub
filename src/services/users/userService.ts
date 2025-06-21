
import { supabase } from '@/integrations/supabase/client';
import { UserFormData, FullUserData } from '@/types/user';

export interface CreateUserResult {
  success: boolean;
  data?: FullUserData;
  error?: string;
}

export const createUser = async (userData: UserFormData): Promise<CreateUserResult> => {
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: 'temporary-password', // This should be handled properly
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        status: userData.status || 'active'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      });

    if (roleError) throw roleError;

    return {
      success: true,
      data: {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        name: userData.full_name,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id,
        phone: userData.phone,
        position: userData.position,
        language: userData.language,
        status: userData.status
      }
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getUsers = async () => {
  // Implementation
  return [];
};

export const getUser = async (id: string) => {
  // Implementation
  return null;
};

export const updateUser = async (id: string, data: Partial<FullUserData>) => {
  // Implementation
  return { success: true };
};

export const deleteUser = async (id: string) => {
  // Implementation
  return { success: true };
};

export const resetUserPassword = async (email: string) => {
  // Implementation
  return { success: true };
};

export const getAdminEntity = async (userId: string) => {
  // Implementation
  return null;
};
