
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi məlumatlarını əldə et (profil və rol)
export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    console.log(`Profil məlumatlarını alarikən, istifadəçi ID: ${userId}`);
    
    // Auth istifadəçi məlumatlarını əldə et
    const { data: authData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth istifadəçi məlumatlarını əldə edərkən xəta:', userError);
      throw new Error('İstifadəçi avtorizasiyası xətası');
    }
    
    // Profil məlumatlarını əldə et
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profil tapılmadı, yenisini yaradırıq');
      
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
        throw new Error('İstifadəçi profili yaradıla bilmədi');
      }
      
      profileData = newProfile;
    } else if (profileError) {
      console.error('Profil məlumatlarını əldə edərkən xəta:', profileError);
      throw new Error('Profil məlumatları əldə edilə bilmədi');
    }
    
    if (!profileData) {
      throw new Error('İstifadəçi profili tapılmadı');
    }
    
    // Default profil məlumatları
    const profile: Profile = {
      id: userId,
      full_name: profileData.full_name || '',
      avatar: profileData.avatar || null,
      phone: profileData.phone || null,
      position: profileData.position || null,
      language: profileData.language || 'az',
      last_login: profileData.last_login || null,
      status: (profileData.status as 'active' | 'inactive' | 'blocked') || 'active',
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: profileData.updated_at || new Date().toISOString()
    };
    
    console.log('Rol məlumatları alınır...');
    
    // İlk öncə user_roles cədvəlindən rol məlumatlarını əldə etməyə çalışaq
    let { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Əgər rol tapılmadısa və ya xəta varsa, xəta mesajı yazdıraq və yeni rol yaratma əməliyyatını başlataq
    if (roleError || !roleData) {
      console.warn('Rol məlumatları tapılmadı, yeni rol yaradılacaq:', roleError?.message);
      
      // Default rol və məlumatlar
      const defaultRole: UserRole = 'schooladmin';
      
      // Yeni rol məlumatları yaradırıq
      const { data: newRoleData, error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: defaultRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (createRoleError) {
        console.error('Rol yaradarkən xəta:', createRoleError);
        throw new Error('İstifadəçi üçün rol təyin edilə bilmədi');
      }
      
      roleData = newRoleData;
    }
    
    if (!roleData) {
      throw new Error('İstifadəçi üçün rol məlumatları əldə edilə bilmədi');
    }
    
    // Rolun adını normalize et - case-sensitive problemləri həll etmək üçün
    const normalizedRole = normalizeRole(roleData.role || 'schooladmin');
    
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
