
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserStatus } from '@/types/auth';

// Login with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (err) {
    console.error('Login error:', err);
    return { data: null, error: err };
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role
        }
      }
    });
    
    if (error) throw error;
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: userData.full_name,
          email: email,
          phone: userData.phone,
          position: userData.position,
          language: userData.language || 'az',
          status: userData.status as UserStatus || 'active',
          notification_settings: {
            email: true,
            push: true,
            app: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
      
      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (roleError) {
        console.error('Error creating user role:', roleError);
      }
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Registration error:', err);
    return { data: null, error: err };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: Partial<FullUserData>) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        position: profileData.position,
        language: profileData.language,
        avatar: profileData.avatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (err) {
    console.error('Update profile error:', err);
    return { data: null, error: err };
  }
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    
    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.error('Error fetching user role:', roleError);
    }
    
    // Combine data
    const userData: FullUserData = {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      role: roleData?.role || 'schooladmin',
      region_id: roleData?.region_id,
      sector_id: roleData?.sector_id,
      school_id: roleData?.school_id,
      phone: profileData.phone,
      position: profileData.position,
      language: profileData.language,
      avatar: profileData.avatar,
      status: profileData.status as UserStatus,
      last_login: profileData.last_login,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
      notification_settings: {
        email: true,
        push: true,
        app: true
      }
    };
    
    return userData;
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }
};
