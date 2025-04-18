
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const assignExistingUserAsSectorAdmin = async (userId: string, sectorId: string) => {
  try {
    // Sector admin təyin etmək funksiyası
    const { data, error } = await supabase.rpc('assign_sector_admin', {
      p_user_id: userId,
      p_sector_id: sectorId
    });

    if (error) {
      console.error('Sector admin təyin edilərkən xəta:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Xəta:', error);
    return { success: false, error: error.message || 'Bilinməyən xəta' };
  }
};

export const removeSectorAdmin = async (sectorId: string) => {
  try {
    // Sector admini silmək funksiyası
    const { data, error } = await supabase
      .from('sectors')
      .update({ admin_id: null, admin_email: null })
      .eq('id', sectorId);

    if (error) {
      console.error('Sector admin silinərkən xəta:', error);
      return { success: false, error: error.message };
    }

    // Əlaqədar user_roles-i də silək
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('sector_id', sectorId)
      .eq('role', 'sectoradmin');

    if (rolesError) {
      console.error('Rol silinərkən xəta:', rolesError);
      return { success: false, error: rolesError.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Xəta:', error);
    return { success: false, error: error.message || 'Bilinməyən xəta' };
  }
};

export const createSectorAdmin = async (sectorId: string, userData: any) => {
  try {
    // İstifadəçi yaratma və sector admin təyin etmə
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
        },
      },
    });

    if (signUpError) {
      return { success: false, error: signUpError.message };
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      return { success: false, error: 'İstifadəçi yaradıla bilmədi' };
    }

    // Profil yaratma
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Sector admin rolunu təyin etmə
    const result = await assignExistingUserAsSectorAdmin(userId, sectorId);
    
    if (!result.success) {
      return result;
    }

    return { success: true, data: signUpData };
  } catch (error: any) {
    console.error('Xəta:', error);
    return { success: false, error: error.message || 'Bilinməyən xəta' };
  }
};
