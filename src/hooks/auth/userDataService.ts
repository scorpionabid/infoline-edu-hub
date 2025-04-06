
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi məlumatlarını əldə etmə (profil və rol)
export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    console.log(`İstifadəçi məlumatları alınır, ID: ${userId}`);
    
    // Auth istifadəçi məlumatlarını əldə et
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth məlumatları alınarkən xəta:', authError);
      throw new Error('İstifadəçi avtorizasiyası xətası');
    }
    
    if (!authData.user) {
      console.error('Auth məlumatları alındı, lakin user obyekti yoxdur');
      throw new Error('İstifadəçi avtorizasiyası xətası - istifadəçi obyekti yoxdur');
    }
    
    // Profil məlumatlarını əldə et - xəta halında yeni profil yaratma
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    let profile: Profile;
    
    if (profileError || !profileData) {
      console.log('Mövcud profil tapılmadı, yeni profil yaradılır');
      
      // Email və ya default ad
      const email = authData.user.email || '';
      const defaultName = email.split('@')[0] || 'İstifadəçi';
      
      // Yeni profil məlumatlarını hazırla
      const newProfileData = {
        id: userId,
        full_name: defaultName,
        language: 'az',
        status: 'active' as 'active' | 'inactive' | 'blocked',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        // Yeni profil yaratmağa cəhd et
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select('*')
          .single();
        
        if (insertError) {
          console.error('Profil yaratma xətası:', insertError);
          throw new Error('İstifadəçi profili yaradıla bilmədi');
        }
        
        profile = insertedProfile as Profile;
      } catch (createError) {
        console.error('Profil yaratma xətası:', createError);
        
        // Güman ki profil artıq var, yenidən yoxlayaq (race condition)
        const { data: existingProfile, error: recheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (recheckError || !existingProfile) {
          console.error('Təkrar profil yoxlama xətası:', recheckError);
          throw new Error('İstifadəçi profili yoxlama və ya yaratma xətası');
        }
        
        profile = existingProfile as Profile;
      }
    } else {
      profile = profileData as Profile;
    }
    
    // Rol məlumatlarını əldə et
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Rol yoxdursa, əsas rol məlumatları yaradaq
    let userRole: UserRole = 'user';
    let regionId: string | null = null;
    let sectorId: string | null = null;
    let schoolId: string | null = null;
    
    if (roleError || !roleData) {
      console.warn('İstifadəçi üçün rol tapılmadı, default rol istifadə olunur');
      
      // İstifadəçi metadatasında rol varsa istifadə et
      if (authData.user.user_metadata && authData.user.user_metadata.role) {
        userRole = normalizeRole(authData.user.user_metadata.role);
      } else {
        userRole = 'user';
      }
    } else {
      userRole = normalizeRole(roleData.role);
      regionId = roleData.region_id;
      sectorId = roleData.sector_id;
      schoolId = roleData.school_id;
    }
    
    // Admin idarə etdiyi müəssisə məlumatlarını əldə etmək
    let adminEntityData: any = null;
    
    try {
      if (userRole === 'regionadmin' && regionId) {
        const { data: regionData } = await supabase
          .from('regions')
          .select('name, status')
          .eq('id', regionId)
          .maybeSingle();
        
        if (regionData) {
          adminEntityData = {
            type: 'region',
            name: regionData.name,
            status: regionData.status
          };
        }
      } else if (userRole === 'sectoradmin' && sectorId) {
        const { data: sectorData } = await supabase
          .from('sectors')
          .select('name, status, regions(name)')
          .eq('id', sectorId)
          .maybeSingle();
        
        if (sectorData) {
          adminEntityData = {
            type: 'sector',
            name: sectorData.name,
            status: sectorData.status,
            regionName: sectorData.regions?.name
          };
        }
      } else if (userRole === 'schooladmin' && schoolId) {
        const { data: schoolData } = await supabase
          .from('schools')
          .select('name, status, type, sectors(name), regions(name)')
          .eq('id', schoolId)
          .maybeSingle();
        
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
    } catch (entityError) {
      console.error('Admin entity məlumatlarını əldə edərkən xəta:', entityError);
      // Entity xətası kritik deyil, null ilə davam edək
    }
    
    // Tam istifadəçi datası
    const fullUserData: FullUserData = {
      id: userId,
      email: authData.user.email || '',
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
      
      // Admin entity haqqında məlumatlar
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
      adminEntity: fullUserData.adminEntity?.name || 'yoxdur'
    });
    
    return fullUserData;
  } catch (error) {
    console.error('İstifadəçi məlumatlarını əldə edərkən xəta baş verdi:', error);
    throw error;
  }
};

// Rol adını normalize et (kiçik hərflərə çevir, xüsusi simvolları təmizlə)
const normalizeRole = (role: string): UserRole => {
  if (!role) return 'user'; // Default rol
  
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
    'school-admin': 'schooladmin',
    'user': 'user'
  };
  
  // Xəritəmizdə uyğun olan rolu qaytar, yoxdursa default olaraq user
  return roleMap[roleStr] || 'user';
};

// Audit loq əlavə etmək üçün funksiya
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
