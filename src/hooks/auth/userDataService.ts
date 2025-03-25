
import { supabase } from '@/integrations/supabase/client';
import { Profile, FullUserData, UserRole } from '@/types/supabase';

// İstifadəçi məlumatlarını əldə et (profil və rol)
export const fetchUserData = async (userId: string): Promise<FullUserData> => {
  try {
    console.log(`Profil məlumatları alınır, istifadəçi ID: ${userId}`);
    
    // Profil məlumatlarını əldə et
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.warn('Profil məlumatlarını əldə edərkən xəta:', profileError);
      // Boş profil məlumatları ilə davam edək
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
      // Burada status tipini uyğun tipə çeviririk
      status: (profileData?.status as 'active' | 'inactive' | 'blocked') || 'active',
      created_at: profileData?.created_at || new Date().toISOString(),
      updated_at: profileData?.updated_at || new Date().toISOString()
    };
    
    console.log('Rol məlumatları alınır...');
    
    // Rol məlumatlarını əldə et
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.warn('Rol məlumatlarını əldə edərkən xəta:', roleError);
      throw new Error(`Rol məlumatları əldə edilə bilmədi: ${roleError.message}`);
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
    
    // Tam istifadəçi datası
    const fullUserData: FullUserData = {
      id: userId,
      email: authData.user?.email || '',
      full_name: profile.full_name,
      role: roleData.role as UserRole,
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
