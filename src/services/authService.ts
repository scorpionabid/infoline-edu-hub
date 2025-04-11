
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * İstifadəçinin mövcud sessiyasını yoxlayır və məlumatlarını qaytarır
 */
export const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Sessiya yoxlanması zamanı xəta:', error);
      return { session: null, error };
    }
    
    if (!session) {
      return { session: null, error: null };
    }
    
    return { session, error: null };
  } catch (error) {
    console.error('Sessiya yoxlanmasında gözlənilməz xəta:', error);
    return { session: null, error };
  }
};

/**
 * İstifadəçi rolunu təyin edir və profil məlumatlarını əldə edir
 */
export const fetchUserRole = async (userId: string) => {
  try {
    // user_roles cədvəlindən istifadəçi rolunu əldə edirik
    const { data: userRoleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) {
      console.error('Rol məlumatları əldə edilərkən xəta:', roleError);
      return { role: null, error: roleError };
    }
    
    if (!userRoleData) {
      console.warn('İstifadəçi üçün rol tapılmadı');
      return { role: null, error: null };
    }
    
    return { 
      role: userRoleData.role,
      regionId: userRoleData.region_id,
      sectorId: userRoleData.sector_id,
      schoolId: userRoleData.school_id,
      error: null
    };
  } catch (error) {
    console.error('İstifadəçi rolu əldə edilərkən xəta:', error);
    return { role: null, error };
  }
};

/**
 * Profil məlumatlarını əldə edir
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Profil məlumatları əldə edilərkən xəta:', profileError);
      return { profile: null, error: profileError };
    }
    
    return { profile: profileData, error: null };
  } catch (error) {
    console.error('Profil məlumatları əldə edilərkən xəta:', error);
    return { profile: null, error };
  }
};

/**
 * Sistemdən çıxış üçün metod
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sistemdən çıxarkən xəta:', error);
      toast.error('Sistemdən çıxarkən xəta baş verdi');
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Sistemdən çıxış zamanı gözlənilməz xəta:', error);
    toast.error('Sistemdən çıxarkən xəta baş verdi');
    return { success: false, error };
  }
};
