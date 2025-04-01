
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
    
    // user_metadata-dan birbaşa rol məlumatlarını əldə edək
    // Bu rekursiv policy xətasını aradan qaldırmaq üçün auth.users-dən user_metadata istifadə edirik
    const userMetadata = authUser.user.user_metadata || {};
    const userRole = userMetadata.role || 'schooladmin';
    const regionId = userMetadata.region_id || null;
    const sectorId = null; // metadata-da olmaya bilər
    const schoolId = null; // metadata-da olmaya bilər
    
    console.log('[fetchUserData] User role from metadata:', userRole);
    console.log('[fetchUserData] Region ID from metadata:', regionId);
    
    // Profil məlumatlarını əldə edək - əgər problem yaşanırsa catchda defaultla davam et
    console.log(`[fetchUserData] Fetching profile data for user ID: ${userId}`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1)
      .maybeSingle();
      
    if (profileError) {
      console.warn('[fetchUserData] Profile fetch error:', profileError);
    }
    
    // Default profil yaradırıq
    const defaultProfile = {
      id: userId,
      full_name: profile?.full_name || userMetadata.full_name || authUser.user.email?.split('@')[0] || 'User',
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
    
    // Region məlumatlarını əldə etməyə çalışaq (əgər region_id varsa)
    let regionData = null;
    if (regionId) {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .eq('id', regionId)
          .limit(1)
          .maybeSingle();
          
        if (!error && data) {
          regionData = data;
        }
      } catch (err) {
        console.error('[fetchUserData] Error fetching region data:', err);
      }
    }
    
    // Tam istifadəçi məlumatları obyektini formalaşdıraq
    const fullUserData: FullUserData = {
      id: userId,
      email: authUser.user.email || '',
      role: userRole,
      full_name: defaultProfile.full_name || '',
      name: defaultProfile.full_name || '', // name = full_name
      phone: defaultProfile.phone || '',
      position: defaultProfile.position || '',
      language: defaultProfile.language || 'az',
      avatar: defaultProfile.avatar || '',
      status: typedStatus,
      school: null,
      school_id: schoolId,
      schoolId: schoolId,
      sector: null,
      sector_id: sectorId,
      sectorId: sectorId,
      region: regionData,
      region_id: regionId,
      regionId: regionId,
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
