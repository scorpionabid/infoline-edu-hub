
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi məlumatlarını əldə et (profil və rol)
export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    console.log(`Profil məlumatlarını alarikən, istifadəçi ID: ${userId}`);
    
    // Auth istifadəçi məlumatlarını ilk olaraq əldə edək (email üçün)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth məlumatlarını əldə edərkən xəta:', authError);
      throw authError;
    }
    
    const userEmail = authData?.user?.email || '';
    console.log(`İstifadəçi email: ${userEmail}`);
    
    // Profil məlumatlarını əldə et
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // single() əvəzinə maybeSingle() istifadə edirik
    
    // Profil tapılmadı və ya xəta varsa
    if (profileError) {
      console.error('Profil məlumatlarını əldə edərkən xəta:', profileError);
      throw profileError;
    }
    
    // Profil tapılmadısa, yenisini yaradaq
    if (!profileData) {
      console.log('Profil yoxdur, yenisini yaradırıq');
      
      // Yeni profil yarat
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userEmail.split('@')[0] || 'İstifadəçi',
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
    
    // user_roles cədvəlindən rol məlumatlarını əldə edək
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(); // single() əvəzinə maybeSingle() istifadə edirik
    
    // Əgər user_roles-da tapılmadısa, bir rol yaradaq
    if (roleError) {
      console.error('Rol məlumatlarını əldə edərkən xəta:', roleError);
      throw roleError;
    }
    
    let userRole: UserRole = 'schooladmin'; // Default rol
    let regionId: string | undefined = undefined;
    let sectorId: string | undefined = undefined;
    let schoolId: string | undefined = undefined;
    
    if (!roleData) {
      console.log('user_roles cədvəlində rol tapılmadı, yeni rol yaradılır...');
      
      // Superadmin üçün xüsusi yoxlama
      const isSuperAdmin = userEmail === 'superadmin@infoline.az';
      userRole = isSuperAdmin ? 'superadmin' : 'schooladmin';
      
      // Yeni rol yarat
      const { data: newRoleData, error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: userRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (createRoleError) {
        console.error('Rol yaradarkən xəta:', createRoleError);
        throw new Error(`Rol məlumatları əldə edilə bilmədi: ${createRoleError.message}`);
      }
      
      // Rol məlumatlarını təyin et
      userRole = normalizeRole(newRoleData.role);
    } else {
      // Mövcud rol məlumatlarını əldə et
      userRole = normalizeRole(roleData.role);
      regionId = roleData.region_id;
      sectorId = roleData.sector_id;
      schoolId = roleData.school_id;
    }
    
    // Tam istifadəçi datası
    const fullUserData: FullUserData = {
      id: userId,
      email: userEmail,
      full_name: profile.full_name,
      role: userRole,
      region_id: regionId,
      sector_id: sectorId,
      school_id: schoolId,
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
      regionId: regionId,
      sectorId: sectorId,
      schoolId: schoolId,
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
const normalizeRole = (role: string): UserRole => {
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
