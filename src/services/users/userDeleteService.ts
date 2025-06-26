
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUser } from './userFetchService';

// Mock audit log function - simplified
const addAuditLog = async (action: string, entityType: string, entityId: string, oldData: any, newData: any) => {
  console.log('Audit log:', { action, entityType, entityId, oldData, newData });
};

// İstifadəçini sil
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Əvvəlki məlumatları əldə edək audit üçün
    const oldUser = await getUser(userId);
    
    // Həqiqi layihədə bu edge function ilə edilməlidir
    // Burada süni arxa plan əməliyyatları təqlid edirik
    
    // Profili sil (RLS-ə görə user_roles də avtomatik silinəcək)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    // Audit log əlavə et
    await addAuditLog(
      'delete',
      'user',
      userId,
      oldUser,
      // null
    );
    
    toast.success('İstifadəçi uğurla silindi', {
      description: 'İstifadəçi sistemdən silindi'
    });
    
    return true;
  } catch (error: any) {
    console.error('İstifadəçi silmə zamanı xəta baş verdi:', error);
    
    toast.error('İstifadəçi silmə zamanı xəta baş verdi', {
      description: error.message
    });
    
    return false;
  }
};
