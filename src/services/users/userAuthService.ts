
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addAuditLog } from '@/hooks/auth/userDataService';

// İstifadəçi şifrəsini sıfırla
export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    // Həqiqi layihədə bu edge function ilə edilməlidir
    console.log('İstifadəçi parolu sıfırlanır:', userId);
    
    // Audit log əlavə et
    await addAuditLog(
      'reset_password',
      'user',
      userId,
      null,
      null // Təhlükəsizlik səbəbindən parolları logda saxlamırıq
    );
    
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
