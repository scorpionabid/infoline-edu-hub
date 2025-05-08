import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { UserRole } from '@/types/supabase';

export const getUserProfile = async (userId: string): Promise<FullUserData | null> => {
  try {
    const defaultRole: UserRole = 'user';  // Using the correct type now

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', userId)
      .single();
      
    if (roleError && roleError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - not a critical error, we'll use default role
      console.warn('Error fetching user role:', roleError);
    }
    
    const userData: FullUserData = {
      id: userId,
      email: profile.email || '',
      full_name: profile.full_name || '',
      name: profile.full_name || '',
      role: (roleData?.role as UserRole) || defaultRole,
      region_id: roleData?.region_id || null,
      regionId: roleData?.region_id || null,
      sector_id: roleData?.sector_id || null,
      sectorId: roleData?.sector_id || null,
      school_id: roleData?.school_id || null,
      schoolId: roleData?.school_id || null,
      phone: profile.phone || null,
      position: profile.position || null,
      avatar: profile.avatar || null,
      language: profile.language || 'az',
      status: profile.status || 'active',
      last_login: profile.last_login || null,
      lastLogin: profile.last_login || null,
      created_at: profile.created_at || null,
      createdAt: profile.created_at || null,
      updated_at: profile.updated_at || null,
      updatedAt: profile.updated_at || null
    };
    
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string, 
  userData: Partial<FullUserData>
): Promise<{ success: boolean; error: any }> => {
  try {
    // Extract profile fields (exclude role and related properties)
    const { 
      role, region_id, sector_id, school_id, regionId, sectorId, schoolId, 
      ...profileData 
    } = userData;

    // Update profile data
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) throw error;
    
    // Update user roles if role or related IDs are provided
    if (role || region_id || sector_id || school_id || regionId || sectorId || schoolId) {
      // Check if this user already has a role entry
      const { data: existingRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      
      if (rolesError) throw rolesError;
      
      // Prepare role data
      const roleData = {
        role: role as UserRole,
        region_id: region_id || regionId,
        sector_id: sector_id || sectorId,
        school_id: school_id || schoolId,
      };
      
      // Insert or update role
      if (existingRoles && existingRoles.length > 0) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update(roleData)
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            ...roleData
          });
          
        if (insertError) throw insertError;
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};
