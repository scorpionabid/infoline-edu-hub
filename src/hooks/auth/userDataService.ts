
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
    
    // Əgər profile tapılmadısa, xəta qaytaraq
    if (!profileData) {
      console.error('No profile data found for userId:', userId);
      
      // Profil yaratmağa cəhd edək
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          throw new Error('Failed to get user information');
        }
        
        // Profil məlumatlarını yaradaq
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: userData.user.email || 'İstifadəçi',
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (createError) {
          console.error('Failed to create profile:', createError);
          throw createError;
        }
        
        // Yeni yaradılan profili əldə edək
        const { data: newProfile, error: newProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (newProfileError || !newProfile) {
          throw new Error('Failed to fetch newly created profile');
        }
        
        profileData = newProfile;
      } catch (createError) {
        console.error('Error creating profile:', createError);
        throw new Error('User profile data not found and could not be created');
      }
    }
    
    // user_roles cədvəlindən istifadəçi rolunu əldə etməyə çalışaq
    let roleData = null;
    try {
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleError) {
        console.error('Role data fetch error:', roleError);
        // Xəta olsa da davam edirik, varsayılan rol təyin edəcəyik
      } else {
        roleData = data;
      }
    } catch (roleError) {
      console.error('Error fetching role data:', roleError);
      // Xəta olsa da davam edirik
    }
    
    // Rol tapılmadısa, yaratmağa çalışaq
    if (!roleData) {
      try {
        // Superadmin üçün xüsusi yoxlama
        if (profileData.full_name.includes('superadmin') || 
            (await supabase.auth.getUser()).data.user?.email?.includes('superadmin')) {
          
          // Rol məlumatlarını yaradaq
          const { error: createRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: 'superadmin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (createRoleError) {
            console.error('Failed to create role:', createRoleError);
          } else {
            // Yeni yaradılan rolu əldə edək
            const { data: newRole, error: newRoleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle();
              
            if (!newRoleError && newRole) {
              roleData = newRole;
            }
          }
        }
      } catch (createError) {
        console.error('Error creating role:', createError);
      }
    }
    
    // DB dən email ünvanını əldə edə bilmədiyimiz üçün istifadəçi obyektini götürək
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User fetch error:', userError);
      throw new Error('Failed to fetch user data');
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
      role: roleData?.role || 'schooladmin', // varsayılan rol
      region_id: roleData?.region_id,
      sector_id: roleData?.sector_id,
      school_id: roleData?.school_id,
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
      regionId: roleData?.region_id,
      sectorId: roleData?.sector_id,
      schoolId: roleData?.school_id,
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
    
    // Profil məlumatlarını yeniləyək - last_login
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Failed to update last_login:', updateError);
      } else {
        console.log(`${userData.email} üçün son giriş tarixi yeniləndi`);
      }
    } catch (updateError) {
      console.error('Error updating last_login:', updateError);
    }
    
    // Rol məlumatlarını yoxlayaq
    try {
      const { data: checkRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
        
      console.log(`${userData.email} üçün rol artıq mövcuddur: ${checkRole?.role || 'bilinməyən'}`);
    } catch (checkError) {
      console.error('Error checking role:', checkError);
    }
    
    return userData;
  } catch (error) {
    console.error('fetchUserData error:', error);
    throw error;
  }
}
