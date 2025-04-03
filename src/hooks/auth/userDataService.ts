
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';

export const fetchUserData = async (): Promise<FullUserData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('User not found in auth session');
      return null;
    }
    
    return await fetchUserById(user.id);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

export const fetchUserById = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Get user role from user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (roleError) {
      console.error('Error getting user role:', roleError);
      return null;
    }
    
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return null;
    }
    
    if (!profileData) {
      console.warn('No profile found for user:', userId);
      return null;
    }
    
    // Get auth user information
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const email = authUser?.email || profileData.email;
    
    // Get related information based on role
    let schoolData = null;
    let sectorData = null;
    let regionData = null;
    
    if (roleData?.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', roleData.school_id)
        .maybeSingle();
        
      schoolData = school || null;
    }
    
    if (roleData?.sector_id) {
      const { data: sector } = await supabase
        .from('sectors')
        .select('*')
        .eq('id', roleData.sector_id)
        .maybeSingle();
        
      sectorData = sector || null;
    }
    
    if (roleData?.region_id) {
      const { data: region } = await supabase
        .from('regions')
        .select('*')
        .eq('id', roleData.region_id)
        .maybeSingle();
        
      regionData = region || null;
    }
    
    // Type assertion for role
    const userRole = roleData?.role as UserRole || 'schooladmin' as UserRole;
    
    // Prepare full user data
    const fullUserData: FullUserData = {
      id: userId,
      email: email || '',
      full_name: profileData.full_name || '',
      name: profileData.full_name || '',
      role: userRole,
      phone: profileData.phone || null,
      position: profileData.position || null,
      language: profileData.language || 'az',
      avatar: profileData.avatar || null,
      status: profileData.status || 'active',
      last_login: profileData.last_login || null,
      created_at: profileData.created_at || null,
      updated_at: profileData.updated_at || null,
      region: regionData,
      sector: sectorData,
      school: schoolData,
      region_id: roleData?.region_id || null,
      sector_id: roleData?.sector_id || null,
      school_id: roleData?.school_id || null,
      regionId: roleData?.region_id || null,
      sectorId: roleData?.sector_id || null,
      schoolId: roleData?.school_id || null,
      lastLogin: profileData.last_login || null,
      createdAt: profileData.created_at || null,
      updatedAt: profileData.updated_at || null,
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true,
      },
      // User interfeysi ilə uyğunluq üçün
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    };
    
    return fullUserData;
  } catch (error) {
    console.error('Error in fetchUserById:', error);
    return null;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error || !data) {
      return null;
    }
    
    return data.role as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const updateLastLogin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        last_login: new Date().toISOString(),
      })
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating last login:', error);
    return false;
  }
};
