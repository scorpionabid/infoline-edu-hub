
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// İstifadəçini sil
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Həqiqi layihədə bu edge function ilə edilməlidir
    // Burada süni arxa plan əməliyyatları təqlid edirik
    
    // Profili sil (RLS-ə görə user_roles də avtomatik silinəcək)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
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
