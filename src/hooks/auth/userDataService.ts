
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi məlumatlarını əldə et (profil və rol)
export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    console.log(`Profil məlumatlarını alarikən, istifadəçi ID: ${userId}`);
    
    // Profil məlumatlarını əldə et
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.warn('Profil məlumatlarını əldə edərkən xəta:', profileError);
      
      // Profil tapılmadı - avtomatik yaradaq
      if (profileError.code === 'PGRST116') {
        console.log('Profil tapılmadı, yenisini yaradırıq');
        
        // Auth istifadəçi məlumatlarını əldə et
        const { data: authData } = await supabase.auth.getUser();
        
        // İstifadəçi email-i və ya default ad
        const email = authData?.user?.email || '';
        const defaultName = email.split('@')[0] || 'İstifadəçi';
        
        // Yeni profil yarat
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: defaultName,
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();
        
        if (createError) {
          console.error('Profil yaradarkən xəta:', createError);
          throw createError;
        }
        
        profileData = newProfile;
      } else {
        // Başqa xəta baş verdi
        throw profileError;
      }
    }
    
    // Default profil məlumatları
    const profile: Profile = {
      id: userId,
      full_name: profileData?.full_name || '',
      avatar: profileData?.avatar || null,
      phone: profileData?.phone || null,
      position: profileData?.position || null,
      language: profileData?.language || 'az',
      last_login: profileData?.last_login || null,
      status: (profileData?.status as 'active' | 'inactive' | 'blocked') || 'active',
      created_at: profileData?.created_at || new Date().toISOString(),
      updated_at: profileData?.updated_at || new Date().toISOString()
    };
    
    console.log('Rol məlumatları alınır...');
    
    // İlk öncə user_roles cədvəlindən rol məlumatlarını əldə etməyə çalışaq
    let { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Əgər user_roles-da tapılmadısa, digər üsullarla davam edək
    if (roleError || !roleData) {
      console.log('user_roles cədvəlində rol tapılmadı, yeni rol yaradılır...');
      
      // Default məlumatlarla rol yaradaq
      const defaultRole: UserRole = 'schooladmin';
      const email = (await supabase.auth.getUser()).data?.user?.email;
      const isSuperAdmin = email === 'superadmin@infoline.az';
      
      // Yeni rol yarat - superadmin@infoline.az üçün superadmin, digərləri üçün schooladmin
      const { data: newRoleData, error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: isSuperAdmin ? 'superadmin' : defaultRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (createRoleError) {
        console.error('Rol yaradarkən xəta:', createRoleError);
        throw new Error(`Rol məlumatları əldə edilə bilmədi: ${createRoleError.message}`);
      }
      
      roleData = newRoleData;
    }
    
    if (!roleData) {
      throw new Error('İstifadəçi üçün rol məlumatları tapılmadı');
    }
    
    // Auth istifadəçi məlumatlarını əldə et
    const { data: authData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('Auth istifadəçi məlumatlarını əldə edərkən xəta:', userError);
      throw userError;
    }
    
    // Rolun adını normalize et - case-sensitive problemləri həll etmək üçün
    const normalizedRole = normalizeRole(roleData.role);
    
    // Tam istifadəçi datası
    const fullUserData: FullUserData = {
      id: userId,
      email: authData.user?.email || '',
      full_name: profile.full_name,
      role: normalizedRole as UserRole,
      region_id: roleData.region_id,
      sector_id: roleData.sector_id,
      school_id: roleData.school_id,
      phone: profile.phone,
      position: profile.position,
      language: profile.language,
      avatar: profile.avatar,
      status: profile.status,
      last_login: profile.last_login,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
      name: profile.full_name,
      regionId: roleData.region_id,
      sectorId: roleData.sector_id,
      schoolId: roleData.school_id,
      lastLogin: profile.last_login,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    console.log('İstifadəçi məlumatları uğurla əldə edildi:', {
      id: fullUserData.id,
      email: fullUserData.email,
      role: fullUserData.role
    });
    
    return fullUserData;
  } catch (error) {
    console.error('İstifadəçi məlumatlarını əldə edərkən xəta baş verdi:', error);
    throw error;
  }
};

// Rol adını normalize et (kiçik hərflərə çevir, xüsusi simvolları təmizlə)
const normalizeRole = (role: string): string => {
  if (!role) return 'schooladmin'; // Default rol
  
  // Əvvəlcə string-ə çevir (əgər obyekt və ya başqa bir tip olarsa)
  const roleStr = String(role).toLowerCase().trim();
  
  // Rol adlarının müxtəlif formatlarının xəritəsi
  const roleMap: Record<string, UserRole> = {
    'superadmin': 'superadmin',
    'super_admin': 'superadmin',
    'super-admin': 'superadmin',
    'regionadmin': 'regionadmin',
    'region_admin': 'regionadmin', 
    'region-admin': 'regionadmin',
    'sectoradmin': 'sectoradmin',
    'sector_admin': 'sectoradmin',
    'sector-admin': 'sectoradmin',
    'schooladmin': 'schooladmin',
    'school_admin': 'schooladmin',
    'school-admin': 'schooladmin'
  };
  
  // Xəritəmizdə uyğun olan rolu qaytar, yoxdursa default olaraq schooladmin
  return roleMap[roleStr] || 'schooladmin';
};
