
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Mövcud istifadəçini sektor admini kimi təyin edir
 * @param userId - Təyin ediləcək istifadəçinin ID-si
 * @param sectorId - Sektorun ID-si
 * @returns Əməliyyatın nəticəsi
 */
export const assignExistingUserAsSectorAdmin = async (
  userId: string,
  sectorId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Sektoru alırıq
    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('id, name, region_id')
      .eq('id', sectorId)
      .single();

    if (sectorError) {
      throw new Error(sectorError.message);
    }

    if (!sector) {
      throw new Error('Sektor tapılmadı');
    }

    // İstifadəçini sektoradmin roluna təyin edirik
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'sectoradmin',
        sector_id: sectorId,
        region_id: sector.region_id
      });

    if (roleError) {
      throw new Error(roleError.message);
    }

    // Sektorda admin_id və admin_email sahələrini yeniləyirik
    // İstifadəçi məlumatlarını alırıq
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    const { error: updateError } = await supabase
      .from('sectors')
      .update({
        admin_id: userId,
        admin_email: userData?.email
      })
      .eq('id', sectorId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Əgər hər şey uğurla başa çatıbsa
    return { success: true };
  } catch (error: any) {
    console.error('Sector admin təyin edilərkən xəta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sektora yeni admin təyin edir
 * @param sectorId - Sektorun ID-si 
 * @param userData - Admin məlumatları
 * @returns Əməliyyatın nəticəsi
 */
export const assignNewUserAsSectorAdmin = async (
  sectorId: string,
  userData: {
    fullName: string;
    email: string;
    password: string;
  }
): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    // Burada yeni istifadəçi yaratma və sektoradmin kimi təyin etmə məntiqi əlavə olunacaq
    // Hələlik implementasiya tam deyil
    return { success: false, error: 'Bu funksiya hələ tam hazır deyil' };
  } catch (error: any) {
    console.error('Yeni sektor admin təyin edilərkən xəta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Sektor adminini silir
 * @param sectorId - Sektorun ID-si
 * @returns Əməliyyatın nəticəsi
 */
export const removeSectorAdmin = async (sectorId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Admin ID və email-i alırıq
    const { data: sector, error: getSectorError } = await supabase
      .from('sectors')
      .select('admin_id')
      .eq('id', sectorId)
      .single();

    if (getSectorError) {
      throw new Error(getSectorError.message);
    }

    const adminId = sector?.admin_id;

    if (!adminId) {
      throw new Error('Bu sektorda admin təyin edilməyib');
    }

    // İstifadəçi rolunu silirik
    const { error: deleteRoleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId)
      .eq('sector_id', sectorId);

    if (deleteRoleError) {
      throw new Error(deleteRoleError.message);
    }

    // Sektor cədvəlində admin məlumatlarını silirik
    const { error: updateSectorError } = await supabase
      .from('sectors')
      .update({
        admin_id: null,
        admin_email: null
      })
      .eq('id', sectorId);

    if (updateSectorError) {
      throw new Error(updateSectorError.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Sektor admin silinərkən xəta:', error);
    return { success: false, error: error.message };
  }
};
