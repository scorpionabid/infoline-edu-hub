
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  console.log(`[fetchUserData] Starting to fetch user data for ID: ${userId}`);
  try {
    // Əsas istifadəçi məlumatlarını əldə edək
    console.log(`[fetchUserData] Fetching auth user data from Supabase`);
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('[fetchUserData] Auth user fetch error:', authError);
      throw authError;
    }
    
    console.log(`[fetchUserData] Auth user data fetched successfully:`, {
      id: authUser.user?.id,
      email: authUser.user?.email
    });
    
    if (!authUser.user) {
      console.error('[fetchUserData] Auth user not found in response');
      throw new Error('İstifadəçi tapılmadı');
    }
    
    // Əvvəlcə istifadəçinin rolunu əldə edək - bu kritikdir
    let userRole = null;
    let region = null;
    let sector = null;
    let school = null;
    
    try {
      console.log(`[fetchUserData] Fetching user role for user ID: ${userId}`);
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
        
      if (userRoleError) {
        console.error('[fetchUserData] User role fetch error:', userRoleError);
        throw userRoleError;
      }
      
      if (!userRoleData) {
        console.warn('[fetchUserData] No user role found, checking if user is superadmin');
        
        // SuperAdmin default rol təyini
        if (authUser.user.email === 'superadmin@infoline.az') {
          console.log('[fetchUserData] Setting default superadmin role');
          userRole = { role: 'superadmin' };
        } else {
          console.warn('[fetchUserData] No role found, defaulting to schooladmin');
          userRole = { role: 'schooladmin' };
        }
      } else {
        console.log('[fetchUserData] User role found:', userRoleData.role);
        userRole = userRoleData;
        
        // RegionAdmin üçün region məlumatlarını əldə edək
        if (userRoleData.role === 'regionadmin' && userRoleData.region_id) {
          console.log(`[fetchUserData] Fetching region data for region_id: ${userRoleData.region_id}`);
          
          const { data: regionData, error: regionError } = await supabase
            .from('regions')
            .select('*')
            .eq('id', userRoleData.region_id)
            .limit(1)
            .maybeSingle();
            
          if (regionError) {
            console.error('[fetchUserData] Region fetch error:', regionError);
          } else if (regionData) {
            console.log('[fetchUserData] Region found:', regionData.name);
            region = regionData;
          }
        }
        
        // Sektor məlumatlarını əldə edək
        if (userRoleData.sector_id) {
          const { data: sectorData, error: sectorError } = await supabase
            .from('sectors')
            .select('*')
            .eq('id', userRoleData.sector_id)
            .limit(1)
            .maybeSingle();
            
          if (sectorError) {
            console.error('[fetchUserData] Sector fetch error:', sectorError);
          } else if (sectorData) {
            console.log('[fetchUserData] Sector found:', sectorData.name);
            sector = sectorData;
          }
        }
        
        // Məktəb məlumatlarını əldə edək
        if (userRoleData.school_id) {
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', userRoleData.school_id)
            .limit(1)
            .maybeSingle();
            
          if (schoolError) {
            console.error('[fetchUserData] School fetch error:', schoolError);
          } else if (schoolData) {
            console.log('[fetchUserData] School found:', schoolData.name);
            school = schoolData;
          }
        }
      }
    } catch (roleError) {
      console.error('[fetchUserData] Error fetching role and related data:', roleError);
      throw roleError;
    }
    
    // Profil məlumatlarını əldə edək
    console.log(`[fetchUserData] Fetching profile data for user ID: ${userId}`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();
      
    console.log(`[fetchUserData] Profile query result:`, { 
      hasData: !!profile, 
      hasError: !!profileError,
      errorMessage: profileError?.message
    });
    
    // Default profil yaradırıq
    const defaultProfile = {
      id: userId,
      full_name: profile?.full_name || authUser.user.email?.split('@')[0] || 'User',
      language: profile?.language || 'az',
      status: profile?.status || 'active',
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString(),
      last_login: profile?.last_login || null,
      phone: profile?.phone || null,
      position: profile?.position || null,
      avatar: profile?.avatar || null,
      email: profile?.email || authUser.user.email
    };
    
    // Status dəyərini düzəldək
    const statusValue = defaultProfile.status || 'active';
    const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
      ? statusValue as 'active' | 'inactive' | 'blocked'
      : 'active' as 'active' | 'inactive' | 'blocked';
    
    // Tam istifadəçi məlumatları obyektini formalaşdıraq
    const fullUserData: FullUserData = {
      id: userId,
      email: authUser.user.email || '',
      role: userRole?.role || 'schooladmin',
      full_name: defaultProfile.full_name || '',
      name: defaultProfile.full_name || '', // name = full_name
      phone: defaultProfile.phone || '',
      position: defaultProfile.position || '',
      language: defaultProfile.language || 'az',
      avatar: defaultProfile.avatar || '',
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
      last_login: defaultProfile.last_login,
      lastLogin: defaultProfile.last_login,
      created_at: defaultProfile.created_at,
      createdAt: defaultProfile.created_at,
      updated_at: defaultProfile.updated_at,
      updatedAt: defaultProfile.updated_at,
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    console.log('[fetchUserData] Successfully constructed full user data:', {
      id: fullUserData.id,
      email: fullUserData.email,
      role: fullUserData.role,
      name: fullUserData.full_name
    });
    
    return fullUserData;
  } catch (error) {
    console.error('[fetchUserData] Error fetching user data:', error);
    
    // Xəta halında default istifadəçi məlumatları qaytara bilərik
    const defaultData = createDefaultUserData(userId);
    console.log('[fetchUserData] Returning default user data due to error:', {
      id: defaultData.id,
      role: defaultData.role
    });
    
    return defaultData;
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
