
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

/**
 * İstifadəçi məlumatlarını təyin edir
 */
export const fetchUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // İstifadəçi rolunu əldə edirik
    const { data: userRoleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.error('İstifadəçi rolu əldə edilərkən xəta:', roleError);
      throw new Error('İstifadəçi rolu əldə edilə bilmədi');
    }
    
    if (!userRoleData) {
      console.warn('İstifadəçi üçün rol tapılmadı');
      throw new Error('İstifadəçi üçün rol təyin edilə bilmədi');
    }
    
    // İstifadəçi profilini əldə edirik
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Profil məlumatları əldə edilərkən xəta:', profileError);
      throw new Error('Profil məlumatları əldə edilə bilmədi');
    }
    
    if (!profileData) {
      throw new Error('İstifadəçi profili tapılmadı');
    }
    
    // Auth istifadəçisini əldə edirik (e-poçt ünvanı üçün)
    const { data: authData } = await supabase.auth.getUser();
    const email = authData?.user?.email || '';
    
    // İstifadəçi məlumatlarını birləşdiririk
    const userData: FullUserData = {
      id: userId,
      email: email,
      full_name: profileData.full_name || 'İsimsiz İstifadəçi',
      role: userRoleData.role,
      region_id: userRoleData.region_id,
      sector_id: userRoleData.sector_id,
      school_id: userRoleData.school_id,
      phone: profileData.phone,
      position: profileData.position,
      language: profileData.language || 'az',
      avatar: profileData.avatar,
      status: profileData.status || 'active',
      last_login: profileData.last_login,
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: profileData.updated_at || new Date().toISOString(),
      
      // JavaScript üçün əlavə aliaslar
      name: profileData.full_name || 'İsimsiz İstifadəçi',
      regionId: userRoleData.region_id,
      sectorId: userRoleData.sector_id,
      schoolId: userRoleData.school_id,
      lastLogin: profileData.last_login,
      createdAt: profileData.created_at || new Date().toISOString(),
      updatedAt: profileData.updated_at || new Date().toISOString(),
      
      // Admin entity
      adminEntity: {
        type: userRoleData.role.replace('admin', '')
      },
      
      // Notifikasiya parametrləri
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    return userData;
  } catch (error) {
    console.error('İstifadəçi məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};
