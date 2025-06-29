import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const assignExistingUserAsSectorAdmin = async (userId: string, sectorId: string) => {
  try {
    // Get sector data to get region_id
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .select('region_id')
      .eq('id', sectorId)
      .single();
      
    if (sectorError) {
      console.error('Sektor məlumatları əldə edilərkən xəta:', sectorError);
      return { success: false, error: sectorError.message };
    }

    // Check if user already has a role
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Rol yoxlanılırkən xəta:', checkError);
      return { success: false, error: checkError.message };
    }
    
    if (!existingRole) {
      // Insert new role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'sectoradmin',
          sector_id: sectorId,
          region_id: sectorData.region_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Rol əlavə edilərkən xəta:', insertError);
        return { success: false, error: insertError.message };
      }
    } else {
      // Update existing role
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          role: 'sectoradmin', 
          sector_id: sectorId,
          region_id: sectorData.region_id,
          school_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Rol yenilənərkən xəta:', updateError);
        return { success: false, error: updateError.message };
      }
    }

    return { success: true };
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
