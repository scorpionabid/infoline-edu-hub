import { supabase } from '@/lib/supabase';
import { FullUserData, UserFormData } from '@/types/user';

export const fetchUserDetails = async (userId: string): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      role: data.role as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin',
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      region_id: data.region_id,
      sector_id: data.sector_id,
      school_id: data.school_id,
      status: data.status,
      language: data.language,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_sign_in_at: data.last_sign_in_at,
      last_login: data.last_login,
      name: data.name,
      entityName: data.entityName,
      notification_settings: data.notification_settings,
      preferences: data.preferences,
      avatar: data.avatar,
      phone: data.phone,
      position: data.position,
      id: data.id
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<FullUserData>) => {
  try {
    const { avatar_url, avatar, ...updateData } = updates;
    const profileUpdates = {
      ...updateData,
      avatar: avatar_url || avatar
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userData: UserFormData) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          status: userData.status,
          language: userData.language,
        },
      ]);

    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};
