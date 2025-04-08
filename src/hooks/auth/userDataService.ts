
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// Rol adını normalizə etmək üçün yardımçı funksiya
function normalizeRole(role: string): UserRole {
  if (!role) {
    console.warn('Normalizə üçün boş rol verildi, default "user" qaytarılır');
    return 'user';
  }
  
  // Rol adını kiçik hərflərə çevir və boşluqları sil
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, '');
  console.log(`Rol normalizə edilir: "${role}" -> "${normalizedRole}"`);
  
  // Valid rolları yoxla
  switch (normalizedRole) {
    case 'superadmin':
    case 'super-admin':
    case 'super_admin':
    case 'admin':
      return 'superadmin';
    
    case 'regionadmin':
    case 'region-admin':
    case 'region_admin':
    case 'regionaladmin':
      return 'regionadmin';
    
    case 'sectoradmin':
    case 'sector-admin':
    case 'sector_admin':
      return 'sectoradmin';
    
    case 'schooladmin':
    case 'school-admin':
    case 'school_admin':
      return 'schooladmin';
    
    case 'teacher':
    case 'instructor':
      // UserRole tipində 'teacher' olmadığı üçün 'user' qaytarırıq
      console.warn(`'teacher/instructor' rolu UserRole tipində yoxdur, 'user' qaytarılır`);
      return 'user';
    
    case 'student':
    case 'pupil':
      // UserRole tipində 'student' olmadığı üçün 'user' qaytarırıq
      console.warn(`'student/pupil' rolu UserRole tipində yoxdur, 'user' qaytarılır`);
      return 'user';
    
    // Default rol
    default:
      console.warn(`Naməlum rol formatı: "${role}", default "user" qaytarılır`);
      return 'user';
  }
}

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
    
    // Əgər sorğu edilən ID ilə auth user ID eyni deyilsə, xəbərdarlıq edək
    if (authData.user.id !== userId) {
      console.warn(`Sorğu edilən istifadəçi ID (${userId}) ilə cari auth istifadəçi ID (${authData.user.id}) eyni deyil`);
      // Bəzi hallarda bu normal ola bilər (məsələn, admin başqa istifadəçinin məlumatlarını əldə edir)
    }
    
    // Profil məlumatlarını ayrı sorğu ilə əldə et
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
        
        console.log('Yeni profil uğurla yaradıldı:', insertedProfile);
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
        
        console.log('Mövcud profil tapıldı (ikinci cəhd):', existingProfile);
        profile = existingProfile as Profile;
      }
    } else {
      console.log('Mövcud profil tapıldı:', profileData);
      profile = profileData as Profile;
    }
    
    // Rol məlumatlarını ayrı sorğu ilə əldə et 
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
        console.log(`Metadata-dan rol əldə edildi: ${userRole}`);
      } else {
        userRole = 'user';
        console.log('Default rol təyin edildi: user');
      }
    } else {
      console.log('İstifadəçi rolu tapıldı:', roleData);
      userRole = normalizeRole(roleData.role);
      regionId = roleData.region_id;
      sectorId = roleData.sector_id;
      schoolId = roleData.school_id;
    }
    
    // Admin idarə etdiyi müəssisə məlumatlarını əldə etmək
    let adminEntityData: any = null;
    
    try {
      if (userRole === 'regionadmin' && regionId) {
        console.log(`Region admin məlumatları əldə edilir, regionId: ${regionId}`);
        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('name, status')
          .eq('id', regionId)
          .maybeSingle();
        
        if (regionError) {
          console.warn('Region məlumatları əldə edərkən xəta:', regionError);
        }
        
        if (regionData) {
          console.log('Region məlumatları tapıldı:', regionData);
          adminEntityData = {
            type: 'region',
            name: regionData.name,
            status: regionData.status
          };
        }
      } else if (userRole === 'sectoradmin' && sectorId) {
        console.log(`Sektor admin məlumatları əldə edilir, sectorId: ${sectorId}`);
        const { data: sectorData, error: sectorError } = await supabase
          .from('sectors')
          .select('name, status, regions(name)')
          .eq('id', sectorId)
          .maybeSingle();
        
        if (sectorError) {
          console.warn('Sektor məlumatları əldə edərkən xəta:', sectorError);
        }
        
        if (sectorData) {
          console.log('Sektor məlumatları tapıldı:', sectorData);
          adminEntityData = {
            type: 'sector',
            name: sectorData.name,
            status: sectorData.status,
            regionName: sectorData.regions?.name
          };
        }
      } else if (userRole === 'schooladmin' && schoolId) {
        console.log(`Məktəb admin məlumatları əldə edilir, schoolId: ${schoolId}`);
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('name, status, type, sectors(name), regions(name)')
          .eq('id', schoolId)
          .maybeSingle();
        
        if (schoolError) {
          console.warn('Məktəb məlumatları əldə edərkən xəta:', schoolError);
        }
        
        if (schoolData) {
          console.log('Məktəb məlumatları tapıldı:', schoolData);
          adminEntityData = {
            type: 'school',
            name: schoolData.name,
            status: schoolData.status,
            schoolType: schoolData.type,
            sectorName: schoolData.sectors?.name,
            regionName: schoolData.regions?.name
          };
        }
      } else if (userRole === 'superadmin') {
        console.log('Superadmin rolü üçün əlavə məlumat tələb olunmur');
        adminEntityData = {
          type: 'superadmin',
          name: 'System Administrator'
        };
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
    
    console.log('Tam istifadəçi məlumatları hazırlandı:', { 
      id: fullUserData.id,
      email: fullUserData.email,
      full_name: fullUserData.full_name,
      role: fullUserData.role,
      adminEntity: adminEntityData 
    });
    return fullUserData;
  } catch (error) {
    console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', error);
    throw new Error('İstifadəçi məlumatlarını əldə etmək mümkün olmadı');
  }
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
