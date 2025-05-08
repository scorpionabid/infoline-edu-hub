
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { UserRole } from '@/types/supabase';

export const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Fetch user profile and roles
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:user_roles(role, region_id, sector_id, school_id)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Process role information
    const defaultRole: UserRole = 'user';
    
    const role = Array.isArray(data?.user_roles) && data.user_roles.length > 0
      ? data.user_roles[0]?.role as UserRole || defaultRole
      : defaultRole;
    
    const regionId = Array.isArray(data?.user_roles) && data.user_roles.length > 0
      ? data.user_roles[0]?.region_id 
      : null;
    
    const sectorId = Array.isArray(data?.user_roles) && data.user_roles.length > 0
      ? data.user_roles[0]?.sector_id 
      : null;
    
    const schoolId = Array.isArray(data?.user_roles) && data.user_roles.length > 0
      ? data.user_roles[0]?.school_id 
      : null;

    // Create full user data object
    const userData: FullUserData = {
      id: userId,
      email: data?.email || '',
      full_name: data?.full_name || '',
      name: data?.full_name || '',
      role: role,
      region_id: regionId,
      regionId: regionId,
      sector_id: sectorId,
      sectorId: sectorId, 
      school_id: schoolId,
      schoolId: schoolId,
      phone: data?.phone,
      position: data?.position,
      language: data?.language || 'az',
      avatar: data?.avatar,
      status: data?.status || 'active',
      last_login: data?.last_login,
      lastLogin: data?.last_login,
      created_at: data?.created_at,
      createdAt: data?.created_at,
      updated_at: data?.updated_at,
      updatedAt: data?.updated_at
    };

    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
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
