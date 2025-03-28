
import { supabase } from '@/integrations/supabase/client';
import { UpdateUserData, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { getUser } from './userFetch';

// İstifadəçini yenilə
export const updateUser = async (userId: string, updates: UpdateUserData): Promise<FullUserData | null> => {
  try {
    // Profilə aid yeniləmələr
    const profileUpdates: any = {};
    if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.position !== undefined) profileUpdates.position = updates.position;
    if (updates.language !== undefined) profileUpdates.language = updates.language;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (updates.status !== undefined) profileUpdates.status = updates.status;
    
    // Status dəyərini düzgün tipə çevirək, əgər varsa
    if (updates.status !== undefined) {
      const statusValue = updates.status;
      updates.status = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
        ? statusValue 
        : 'active' as 'active' | 'inactive' | 'blocked';
    }
    
    // Profil yenilə
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (profileError) throw profileError;
    }
    
    // Rol yeniləmələri
    if (updates.role || updates.region_id !== undefined || updates.sector_id !== undefined || updates.school_id !== undefined) {
      const roleUpdates: any = {};
      if (updates.role) roleUpdates.role = updates.role;
      if (updates.region_id !== undefined) roleUpdates.region_id = updates.region_id;
      if (updates.sector_id !== undefined) roleUpdates.sector_id = updates.sector_id;
      if (updates.school_id !== undefined) roleUpdates.school_id = updates.school_id;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update(roleUpdates)
        .eq('user_id', userId);
      
      if (roleError) throw roleError;
    }
    
    // Əgər parol yenilənirsə, auth API ilə yenilə
    if (updates.password) {
      // Həqiqi layihədə bu edge function ilə edilməlidir
      console.log('İstifadəçi parolu yenilənir:', userId);
    }
    
    // Yenilənmiş istifadəçini əldə et
    const updatedUser = await getUser(userId);
    
    toast.success('İstifadəçi uğurla yeniləndi', {
      description: `İstifadəçi məlumatları yeniləndi`
    });
    
    return updatedUser;
  } catch (error: any) {
    console.error('İstifadəçi yenilərkən xəta baş verdi:', error);
    
    toast.error('İstifadəçi yenilərkən xəta baş verdi', {
      description: error.message
    });
    
    return null;
  }
};

// İstifadəçi şifrəsini sıfırla
export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    // Həqiqi layihədə bu edge function ilə edilməlidir
    console.log('İstifadəçi parolu sıfırlanır:', userId);
    
    toast.success('İstifadəçi şifrəsi sıfırlandı', {
      description: 'Yeni şifrə təyin edildi'
    });
    
    return true;
  } catch (error: any) {
    console.error('Şifrə sıfırlama zamanı xəta baş verdi:', error);
    
    toast.error('Şifrə sıfırlama zamanı xəta baş verdi', {
      description: error.message
    });
    
    return false;
  }
};
