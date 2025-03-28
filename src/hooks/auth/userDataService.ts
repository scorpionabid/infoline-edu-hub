import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    // Əsas istifadəçi məlumatlarını əldə edək
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth user fetch error:', authError);
      throw authError;
    }
    
    if (!authUser.user) {
      throw new Error('İstifadəçi tapılmadı');
    }
    
    console.log('Auth user found:', authUser.user.email);
    
    // Profil məlumatlarını əldə edək
    // Aşağıdakı şəkildə limit=1 əlavə edək
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      
      // Profil məlumatlarını əldə edə bilmədiksə, default məlumatlar təyin edək
      const defaultProfile = {
        id: userId,
        full_name: authUser.user.email?.split('@')[0] || 'User',
        language: 'az',
        status: 'active' as 'active' | 'inactive' | 'blocked',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Profil yaratmağa çalışaq - uğursuz olsa belə davam edirik
      try {
        await supabase
          .from('profiles')
          .insert([defaultProfile]);
          
        console.log('Created new profile for user:', userId);
      } catch (insertError) {
        console.error('Failed to create profile:', insertError);
      }
      
      // İstifadəçiyə default profil məlumatlarını qaytararıq
      return createDefaultUserData(userId, authUser.user.email || '', defaultProfile.full_name);
    }
    
    if (!profile) {
      console.warn('İstifadəçi profili tapılmadı, default məlumatlar təyin edilir');
      
      // Default profil yaradırıq
      const defaultProfile = {
        id: userId,
        full_name: authUser.user.email?.split('@')[0] || 'User',
        language: 'az',
        status: 'active' as 'active' | 'inactive' | 'blocked',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Profil yaratmağa çalışaq - uğursuz olsa belə davam edirik
      try {
        await supabase
          .from('profiles')
          .insert([defaultProfile]);
          
        console.log('Created new profile for user:', userId);
      } catch (insertError) {
        console.error('Failed to create profile:', insertError);
      }
      
      // İstifadəçiyə default profil məlumatlarını qaytararıq
      return createDefaultUserData(userId, authUser.user.email || '', defaultProfile.full_name);
    }
    
    // İstifadəçinin rolunu əldə edək
    let userRole = null;
    let region = null;
    let sector = null;
    let school = null;
    
    try {
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
        
      if (userRoleError) {
        console.error('User role fetch error:', userRoleError);
      } else if (userRoleData) {
        userRole = userRoleData;
        
        // Əlaqəli məlumatları əldə edək (region, sector, school)
        if (userRole.region_id) {
          const { data: regionData } = await supabase
            .from('regions')
            .select('*')
            .eq('id', userRole.region_id)
            .limit(1)
            .maybeSingle();
            
          region = regionData;
        }
        
        if (userRole.sector_id) {
          const { data: sectorData } = await supabase
            .from('sectors')
            .select('*')
            .eq('id', userRole.sector_id)
            .limit(1)
            .maybeSingle();
            
          sector = sectorData;
        }
        
        if (userRole.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('*')
            .eq('id', userRole.school_id)
            .limit(1)
            .maybeSingle();
            
          school = schoolData;
        }
      }
    } catch (roleError) {
      console.error('Error fetching role and related data:', roleError);
    }
    
    // SuperAdmin default rol təyini
    if (authUser.user.email === 'superadmin@infoline.az' && (!userRole || userRole.role !== 'superadmin')) {
      console.log('Setting default superadmin role for superadmin@infoline.az');
      
      try {
        // Role yoxdursa, yaratmağa çalışaq
        if (!userRole) {
          const { data: newRole, error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: 'superadmin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating superadmin role:', insertError);
          } else {
            userRole = newRole;
            console.log('Created superadmin role for user:', userId);
          }
        } 
        // Rol varsa, superadmin olaraq yeniləyək
        else if (userRole.role !== 'superadmin') {
          const { error: updateError } = await supabase
            .from('user_roles')
            .update({
              role: 'superadmin',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error('Error updating to superadmin role:', updateError);
          } else {
            userRole = { ...userRole, role: 'superadmin' };
            console.log('Updated role to superadmin for user:', userId);
          }
        }
      } catch (roleError) {
        console.error('Error managing superadmin role:', roleError);
      }
    }
    
    // Status dəyərini düzəldək
    const statusValue = profile.status || 'active';
    const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
      ? statusValue as 'active' | 'inactive' | 'blocked'
      : 'active' as 'active' | 'inactive' | 'blocked';
    
    // Tam istifadəçi məlumatları obyektini formalaşdıraq
    const fullUserData: FullUserData = {
      id: userId,
      email: authUser.user.email || '',
      role: userRole?.role || 'schooladmin',
      full_name: profile.full_name || '',
      name: profile.full_name || '', // name = full_name
      phone: profile.phone || '',
      position: profile.position || '',
      language: profile.language || 'az',
      avatar: profile.avatar || '',
      status: typedStatus,
      school: school,
      school_id: userRole?.school_id || null,
      schoolId: userRole?.school_id || null,
      sector: sector,
      sector_id: userRole?.sector_id || null,
      sectorId: userRole?.sector_id || null,
      region: region,
      region_id: userRole?.region_id || null,
      regionId: userRole?.region_id || null,
      last_login: profile.last_login,
      lastLogin: profile.last_login,
      created_at: profile.created_at,
      createdAt: profile.created_at,
      updated_at: profile.updated_at,
      updatedAt: profile.updated_at,
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    return fullUserData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Xəta halında default istifadəçi məlumatları qaytara bilərik
    return createDefaultUserData(userId);
  }
};

// Default istifadəçi məlumatları yaradır
const createDefaultUserData = (userId: string, email: string = 'user@example.com', name: string = 'User'): FullUserData => {
  const now = new Date().toISOString();
  
  return {
    id: userId,
    email: email,
    role: email === 'superadmin@infoline.az' ? 'superadmin' : 'schooladmin',
    full_name: name,
    name: name,
    language: 'az',
    status: 'active',
    school: null,
    school_id: null,
    schoolId: null,
    sector: null,
    sector_id: null,
    sectorId: null,
    region: null,
    region_id: null,
    regionId: null,
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    }
  };
};