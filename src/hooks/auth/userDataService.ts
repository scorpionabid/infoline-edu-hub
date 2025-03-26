
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export async function fetchUserData(userId: string): Promise<FullUserData> {
  console.log('fetchUserData called for userId:', userId);
  
  try {
    // profiles cədvəlindən istifadəçi məlumatlarını əldə edək
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Profile data fetch error:', profileError);
      throw new Error('Failed to fetch user profile data');
    }
    
    // user_roles cədvəlindən istifadəçi rolunu əldə edək
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (roleError) {
      console.error('Role data fetch error:', roleError);
      throw new Error('Failed to fetch user role data');
    }
    
    // DB dən email ünvanını əldə edə bilmədiyimiz üçün istifadəçi obyektini götürək
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User fetch error:', userError);
      throw new Error('Failed to fetch user data');
    }
    
    if (!profileData) {
      console.error('No profile data found for userId:', userId);
      throw new Error('User profile data not found');
    }
    
    if (!roleData) {
      console.error('No role data found for userId:', userId);
      throw new Error('User role data not found');
    }
    
    // profileData və roleData-nı birləşdirək
    const userData: FullUserData = {
      id: userId,
      email: user.email || '',
      full_name: profileData.full_name,
      role: roleData.role,
      region_id: roleData.region_id,
      sector_id: roleData.sector_id,
      school_id: roleData.school_id,
      phone: profileData.phone,
      position: profileData.position,
      language: profileData.language || 'az',
      avatar: profileData.avatar,
      status: profileData.status || 'active',
      last_login: profileData.last_login,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
      
      // App üçün alternativ adlar
      name: profileData.full_name,
      regionId: roleData.region_id,
      sectorId: roleData.sector_id,
      schoolId: roleData.school_id,
      lastLogin: profileData.last_login,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
      
      // Default tətbiq xüsusiyyətləri
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    return userData;
  } catch (error) {
    console.error('fetchUserData error:', error);
    throw error;
  }
}
