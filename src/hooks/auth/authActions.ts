import { supabase } from '@/integrations/supabase/client';
import { UserRole, FullUserData } from '@/types/supabase';

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role?: UserRole;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  position?: string;
  language?: string;
  avatar?: string;
  last_login?: string;
  user_metadata?: {
    full_name?: string;
    avatar?: string;
  };
  notificationSettings?: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    system: boolean;
    deadline: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    // Fetch user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.error('Error fetching user role:', roleError);
    }
    
    // Build complete user data
    const userData: FullUserData = {
      id: userId,
      email: profileData?.email || '',
      full_name: profileData?.full_name,
      phone: profileData?.phone,
      position: profileData?.position,
      language: profileData?.language,
      avatar: profileData?.avatar,
      last_login: profileData?.last_login,
      role: roleData?.role as UserRole,
      region_id: roleData?.region_id,
      sector_id: roleData?.sector_id,
      school_id: roleData?.school_id,
      status: profileData?.status,
      created_at: profileData?.created_at,
      updated_at: profileData?.updated_at,
      notificationSettings: {
        inApp: true,
        email: false,
        push: false,
        system: true,
        deadline: true
      }
    };
    
    return userData;
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return null;
  }
};

// Function to create a new user
export const createUser = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  regionId?: string,
  sectorId?: string,
  schoolId?: string
): Promise<{ success: boolean; message: string; userId?: string }> => {
  try {
    // Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });
    
    if (error) {
      throw error;
    }
    
    const userId = data.user.id;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        status: 'active'
      });
    
    if (profileError) {
      throw profileError;
    }
    
    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        region_id: regionId || null,
        sector_id: sectorId || null,
        school_id: schoolId || null
      });
    
    if (roleError) {
      throw roleError;
    }
    
    return {
      success: true,
      message: 'User created successfully',
      userId
    };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error.message || 'Error creating user'
    };
  }
};

// Function to update a user's profile data - export this function for AccountSettings.tsx
export const updateUserProfile = async (userData: Partial<FullUserData>): Promise<{ success: boolean; message: string }> => {
  try {
    const { id, ...profileData } = userData;
    
    if (!id) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }
    
    // Prepare profile update data
    const profileUpdateData: any = {
      full_name: profileData.full_name,
      phone: profileData.phone,
      position: profileData.position,
      language: profileData.language,
      status: profileData.status
    };
    
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', id);
    
    if (profileError) {
      throw profileError;
    }
    
    // Update role if provided
    if (profileData.role) {
      const roleUpdateData: any = {
        role: profileData.role,
        region_id: profileData.region_id || null,
        sector_id: profileData.sector_id || null,
        school_id: profileData.school_id || null
      };
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update(roleUpdateData)
        .eq('user_id', id);
      
      if (roleError) {
        throw roleError;
      }
    }
    
    return {
      success: true,
      message: 'User profile updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      message: error.message || 'Error updating user profile'
    };
  }
};

// Add alias for updateUserProfile to fix the import in AccountSettings.tsx
export const updateUser = updateUserProfile;
