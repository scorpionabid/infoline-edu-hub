
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
    
    // Status dəyərinin tipini düzgün əhatə edək
    // Varsayılan olaraq 'active' istifadə edək, əgər status dəyəri yoxdursa və ya düzgün tipdə deyilsə
    let userStatus: 'active' | 'inactive' | 'blocked' = 'active';
    
    // Əgər profileData.status varsa və düzgün tipdədirsə, onu istifadə edək
    if (profileData.status && ['active', 'inactive', 'blocked'].includes(profileData.status)) {
      userStatus = profileData.status as 'active' | 'inactive' | 'blocked';
    }
    
    // Bütün nullable sahələr üçün varsayılan dəyərlər təmin edək
    // profileData və roleData-nı birləşdirək
    const userData: FullUserData = {
      id: userId,
      email: user.email || '',
      full_name: profileData.full_name || 'İstifadəçi', // varsayılan ad
      role: roleData.role || 'schooladmin', // varsayılan rol
      region_id: roleData.region_id,
      sector_id: roleData.sector_id,
      school_id: roleData.school_id,
      phone: profileData.phone || '',
      position: profileData.position || '',
      language: profileData.language || 'az',
      avatar: profileData.avatar || '',
      status: userStatus,
      last_login: profileData.last_login || new Date().toISOString(),
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: profileData.updated_at || new Date().toISOString(),
      
      // App üçün alternativ adlar
      name: profileData.full_name || 'İstifadəçi',
      regionId: roleData.region_id,
      sectorId: roleData.sector_id,
      schoolId: roleData.school_id,
      lastLogin: profileData.last_login || new Date().toISOString(),
      createdAt: profileData.created_at || new Date().toISOString(),
      updatedAt: profileData.updated_at || new Date().toISOString(),
      
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
