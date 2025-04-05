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
    
    // Əgər rol tapılmadısa və ya xəta varsa, sadəcə xəta mesajı yazdıraq,
    // amma yeni rol yaratma prosesindən imtina edək, çünki rol yaradarkən təkrar açar xətası alınır
    if (roleError || !roleData) {
      console.warn('Rol məlumatları tapılmadı:', roleError?.message);
      throw new Error('İstifadəçi üçün rol təyin edilməyib');
    }
    
    if (!roleData) {
      throw new Error('İstifadəçi üçün rol məlumatları əldə edilə bilmədi');
    }
    
    // Rolun adını normalize et - case-sensitive problemləri həll etmək üçün
    const normalizedRole = normalizeRole(roleData.role || 'schooladmin');
    
    // Admin idarə etdiyi müəssisə məlumatlarını əldə etmək
    let adminEntityData: any = null;
    
    if (normalizedRole === 'regionadmin' && roleData.region_id) {
      const { data: regionData } = await supabase
        .from('regions')
        .select('name, status')
        .eq('id', roleData.region_id)
        .single();
      
      if (regionData) {
        adminEntityData = {
          type: 'region',
          name: regionData.name,
          status: regionData.status
        };
      }
    } else if (normalizedRole === 'sectoradmin' && roleData.sector_id) {
      const { data: sectorData } = await supabase
        .from('sectors')
        .select('name, status, regions(name)')
        .eq('id', roleData.sector_id)
        .single();
      
      if (sectorData) {
        adminEntityData = {
          type: 'sector',
          name: sectorData.name,
          status: sectorData.status,
          regionName: sectorData.regions?.name
        };
      }
    } else if (normalizedRole === 'schooladmin' && roleData.school_id) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name, status, type, sectors(name), regions(name)')
        .eq('id', roleData.school_id)
        .single();
      
      if (schoolData) {
        adminEntityData = {
          type: 'school',
          name: schoolData.name,
          status: schoolData.status,
          schoolType: schoolData.type,
          sectorName: schoolData.sectors?.name,
          regionName: schoolData.regions?.name
        };
      }
    }
    
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
      
      // Admin entitysi haqqında məlumatlar
      adminEntity: adminEntityData,
      
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
      role: fullUserData.role,
      adminEntity: fullUserData.adminEntity?.name
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

// Yeni: Audit loq əlavə etmək üçün funksiya
export const addAuditLog = async (
  action: string, 
  entityType: string, 
  entityId?: string, 
  oldValue?: any, 
  newValue?: any
): Promise<void> => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    
    await supabase.from('audit_logs').insert({
      user_id: authData.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: '', // Client-side bu məlumatı almaq olmur,
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Audit loq əlavə edilərkən xəta:', error);
  }
};
