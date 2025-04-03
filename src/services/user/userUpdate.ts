
import { supabase } from '@/integrations/supabase/client';
import { UpdateUserData, FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { getUser } from './userFetch';

// İstifadəçini yenilə
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<FullUserData | null> => {
  try {
    // İstifadəçi profilini yenilə
    const profileUpdates: any = {};
    
    if (userData.full_name !== undefined) {
      profileUpdates.full_name = userData.full_name;
    }
    
    if (userData.phone !== undefined) {
      profileUpdates.phone = userData.phone;
    }
    
    if (userData.position !== undefined) {
      profileUpdates.position = userData.position;
    }
    
    if (userData.language !== undefined) {
      profileUpdates.language = userData.language;
    }
    
    if (userData.avatar !== undefined) {
      profileUpdates.avatar = userData.avatar;
    }
    
    if (userData.status !== undefined) {
      profileUpdates.status = userData.status;
    }
    
    // Profil məlumatlarını yenilə
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (profileError) throw profileError;
    }
    
    // Rol məlumatlarını yenilə
    const roleUpdates: any = {};
    
    if (userData.role !== undefined) {
      roleUpdates.role = userData.role;
    }
    
    if (userData.region_id !== undefined) {
      roleUpdates.region_id = userData.region_id;
    }
    
    if (userData.sector_id !== undefined) {
      roleUpdates.sector_id = userData.sector_id;
    }
    
    if (userData.school_id !== undefined) {
      roleUpdates.school_id = userData.school_id;
    }
    
    if (Object.keys(roleUpdates).length > 0) {
      roleUpdates.updated_at = new Date().toISOString();
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update(roleUpdates)
        .eq('user_id', userId);
      
      if (roleError) throw roleError;
    }
    
    // Auth məlumatlarını yenilə (bu bir demo simulyasiyası, real layihədə məxsusi edge function olacaq)
    if (userData.email !== undefined || userData.password !== undefined) {
      // Demo məqsədilə, real layihədə Supabase Edge Function istifadə ediləcək
      console.log('Email/Şifrə yeniləməsi:', {
        email: userData.email,
        password: userData.password ? '********' : undefined
      });
    }
    
    // Yenilənmiş istifadəçi məlumatlarını əldə et
    const updatedUser = await getUser(userId);
    
    toast.success('İstifadəçi uğurla yeniləndi', {
      description: `İstifadəçi məlumatları yeniləndi`
    });
    
    return updatedUser;
  } catch (error: any) {
    console.error('İstifadəçi yeniləmə xətası:', error);
    
    toast.error('İstifadəçi yenilərkən xəta baş verdi', {
      description: error.message
    });
    
    return null;
  }
};
