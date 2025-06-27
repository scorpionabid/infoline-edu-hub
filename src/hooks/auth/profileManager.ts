// ============================================================================
// İnfoLine Auth System - Profile Manager
// ============================================================================
// Bu fayl istifadəçi profili və rol məlumatlarının əldə edilməsi və işlənməsini təmin edir

import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from './authTypes';
import { Session } from '@supabase/supabase-js';

/**
 * İstifadəçi profilini və rollarını əldə edir
 * @param userId User ID to fetch profile for
 * @returns Profile data and potential error
 */
export async function fetchUserProfile(userId: string): Promise<{
  profile: any | null;
  error: Error | null;
}> {
  return new Promise(async (resolve) => {
    try {
      // Add timeout protection for profile fetch
      const fetchTimeout = setTimeout(() => {
        console.warn('⚠️ [Auth] Profile fetch timed out after 15s');
        resolve({ profile: null, error: new Error('Profile fetch timeout') });
      }, 15000);
      
      console.log('💬 [Auth] Sending profile fetch request...');
      
      // First try - fetch profile
      let profileResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      // If we got the profile, fetch roles separately
      if (profileResult.data) {
        console.log('💬 [Auth] Profile fetch successful, fetching roles...');
        const rolesResult = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        clearTimeout(fetchTimeout);
        
        // Combine the data
        const combinedProfile = {
          ...profileResult.data,
          user_roles: rolesResult.data
        };
        
        resolve({ 
          profile: combinedProfile, 
          error: profileResult.error || rolesResult.error || null 
        });
      } else {
        clearTimeout(fetchTimeout);
        resolve({ profile: null, error: profileResult.error });
      }
    } catch (error) {
      console.error('❌ [Auth] Profile fetch error:', error);
      resolve({ profile: null, error: error as Error });
    }
  });
}

/**
 * İstifadəçi profilinə əsasən rol məlumatlarını normallaşdırır
 * @param profile User profile data
 * @param session Auth session
 * @returns Normalized user data
 */
export function normalizeUserProfile(profile: any, session: Session): FullUserData {
  console.log('🔍 [Auth] User roles raw data during normalization:', profile?.user_roles);
  
  // Rol təyinatını dəqiqləşdiririk - robust role detection
  let userRole: UserRole = 'user' as UserRole; // default
  let regionId, sectorId, schoolId;
  
  const isKnownSuperAdmin = session.user.email?.toLowerCase() === 'superadmin@infoline.az';
  
  if (isKnownSuperAdmin) {
    userRole = 'superadmin' as UserRole;
  } else if (profile?.user_roles) {
    // Normalize user_roles - həm array həm də object case-lərini handle edirik
    const roleData = Array.isArray(profile.user_roles) 
      ? profile.user_roles[0] 
      : profile.user_roles;
      
    if (roleData?.role) {
      userRole = roleData.role as UserRole;
      regionId = roleData.region_id;
      sectorId = roleData.sector_id;
      schoolId = roleData.school_id;
    }
  }
  
  // Roll təyinatı haqqında ətraflı məlumat ver
  console.log('🔑 [Auth] Role determination during normalization', { 
    email: session.user.email, 
    isKnownSuperAdmin,
    profileExists: !!profile,
    userRolesData: profile?.user_roles,
    userRolesType: profile?.user_roles ? typeof profile.user_roles : 'undefined',
    finalRole: userRole 
  });

  // Normalized user data
  const userData: FullUserData = {
    id: profile.id,
    email: session.user.email || profile.email || '',
    full_name: profile.full_name || '',
    name: profile.full_name || '',
    role: userRole,
    region_id: regionId,
    sector_id: sectorId,
    school_id: schoolId,
    regionId: regionId,
    sectorId: sectorId,
    schoolId: schoolId,
    phone: profile.phone,
    position: profile.position,
    language: profile.language || 'az',
    avatar: profile.avatar,
    status: profile.status || 'active',
    last_login: profile.last_login,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    lastLogin: profile.last_login,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at
  };
  
  return userData;
}

/**
 * Əgər profil əldə edilə bilmirsə, session məlumatlarına əsasən minimal profil yaradır
 * @param session Auth session
 * @returns Minimal user profile
 */
export function createMinimalProfile(session: Session): any {
  console.warn('⚠️ [Auth] Creating minimal profile from session data');
  return {
    id: session.user.id,
    email: session.user.email,
    full_name: '',
    user_roles: null
  };
}

/**
 * İstifadəçi profilini yeniləyir
 * @param userId User ID
 * @param profileData Profile data to update
 */
export async function updateUserProfile(
  userId: string, 
  profileData: Partial<FullUserData>
): Promise<{success: boolean, error: Error | null}> {
  try {
    console.log('🔄 [Auth] Updating user profile:', { userId, fields: Object.keys(profileData) });
    
    // First, update the profile table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        position: profileData.position,
        language: profileData.language,
        avatar: profileData.avatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error('❌ [Auth] Profile update error:', profileError);
      return { success: false, error: profileError };
    }
    
    // If we're updating role-related info, update user_roles table
    if (profileData.role || profileData.region_id || profileData.regionId ||
        profileData.sector_id || profileData.sectorId ||
        profileData.school_id || profileData.schoolId) {
      
      // Check if user_roles entry exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      const roleData = {
        role: profileData.role,
        region_id: profileData.region_id || profileData.regionId,
        sector_id: profileData.sector_id || profileData.sectorId,
        school_id: profileData.school_id || profileData.schoolId,
      };
      
      let roleError;
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update(roleData)
          .eq('user_id', userId);
          
        roleError = error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            ...roleData
          });
          
        roleError = error;
      }
      
      if (roleError) {
        console.error('❌ [Auth] Role update error:', roleError);
        return { success: false, error: roleError };
      }
    }
    
    console.log('✅ [Auth] Profile update successful');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ [Auth] Profile update exception:', error);
    return { success: false, error: error as Error };
  }
}
