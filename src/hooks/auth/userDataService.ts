
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { UserRole } from '@/types/user';

// Function to fetch user data from Supabase
export async function fetchUserData(userId: string): Promise<FullUserData | null> {
  try {
    if (!userId) return null;
    
    // Fetch both profile and role information
    const { data: profile, error: profileError } = await supabase
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
    
    // Default role
    let role: UserRole = 'user';
    let region_id = null;
    let sector_id = null;
    let school_id = null;
    
    if (!roleError && roleData) {
      role = roleData.role as UserRole;
      region_id = roleData.region_id;
      sector_id = roleData.sector_id;
      school_id = roleData.school_id;
    }
    
    // Create FullUserData object from profile and role data
    const userData: FullUserData = {
      id: userId,
      email: profile.email || '',
      full_name: profile.full_name,
      name: profile.full_name,
      avatar: profile.avatar,
      phone: profile.phone,
      position: profile.position,
      role: role,
      region_id: region_id,
      regionId: region_id,
      sector_id: sector_id,
      sectorId: sector_id,
      school_id: school_id,
      schoolId: school_id,
      language: profile.language || 'az',
      status: profile.status || 'active',
      last_login: profile.last_login,
      lastLogin: profile.last_login,
      created_at: profile.created_at,
      createdAt: profile.created_at,
      updated_at: profile.updated_at,
      updatedAt: profile.updated_at,
    };
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Function to update user profile
export async function updateUserProfile(userId: string, updates: Partial<FullUserData>): Promise<boolean> {
  try {
    if (!userId) return false;
    
    // Extract profile fields from updates
    const { 
      full_name, 
      avatar, 
      phone, 
      position, 
      language, 
      status
    } = updates;
    
    const profileUpdates = {
      ...(full_name !== undefined && { full_name }),
      ...(avatar !== undefined && { avatar }),
      ...(phone !== undefined && { phone }),
      ...(position !== undefined && { position }),
      ...(language !== undefined && { language }),
      ...(status !== undefined && { status }),
      updated_at: new Date().toISOString()
    };
    
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}
