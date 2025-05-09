
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

// Get user profile data
export const getUserProfile = async (userId: string): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase.rpc('get_full_user_data', {
      p_user_id: userId
    });
    
    if (error) throw error;
    return data as FullUserData;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Update user profile data
export const updateUserProfile = async (
  userId: string, 
  profileData: Partial<FullUserData>
): Promise<FullUserData | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as FullUserData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Sign in user
export const signInUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Update user password
export const updateUserPassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
}) => {
  try {
    // First create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name
      }
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error('User creation failed');
    }
    
    // Then create the user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: userData.role,
        region_id: userData.region_id || null,
        sector_id: userData.sector_id || null,
        school_id: userData.school_id || null
      });
    
    if (roleError) throw roleError;
    
    return authData.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
