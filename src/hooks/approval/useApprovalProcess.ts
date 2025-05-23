import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/context/LanguageContext';
import { createApprovalNotification } from '@/services/notificationService';

export const useApprovalProcess = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Məlumatları təsdiqləmək
  const approveEntries = useCallback(async (
    schoolId: string, 
    categoryId: string, 
    categoryName: string
  ) => {
    if (!user) return { success: false, error: 'İstifadəçi məlumatları tapılmadı' };
    
    setLoading(true);
    setError(null);
    
    try {
      // Status təsdiqlənmiş kimi yenilənir
      const { error: updateError } = await supabase.rpc('update_entries_status', {
        p_school_id: schoolId,
        p_category_id: categoryId,
        p_status: 'approved',
        p_user_id: user.id
      });
      
      if (updateError) throw updateError;
      
      // Məktəb admin ID-ni əldə edirik
      const { data: schoolAdminData, error: schoolAdminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('school_id', schoolId)
        .eq('role', 'schooladmin')
        .single();
      
      if (schoolAdminError && schoolAdminError.code !== 'PGRST116') {
        console.error('Məktəb admini tapılarkən xəta:', schoolAdminError);
      }
      
      // Məktəb admininə bildiriş göndəririk
      if (schoolAdminData && schoolAdminData.user_id) {
        await createApprovalNotification(
          schoolAdminData.user_id,
          categoryName,
          categoryId,
          true
        );
      }
      
      toast.success(t('dataApproved'), {
        description: t('dataApprovedSuccessfully')
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Təsdiq prosesində xəta:', err);
      setError(err.message);
      
      toast.error(t('error'), {
        description: t('errorApprovingData')
      });
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  // Məlumatları rədd etmək
  const rejectEntries = useCallback(async (
    schoolId: string, 
    categoryId: string, 
    categoryName: string,
    reason: string
  ) => {
    if (!user) return { success: false, error: 'İstifadəçi məlumatları tapılmadı' };
    if (!reason) return { success: false, error: 'Rədd səbəbi tələb olunur' };
    
    setLoading(true);
    setError(null);
    
    try {
      // Status rədd edilmiş kimi yenilənir
      const { error: updateError } = await supabase.rpc('update_entries_status', {
        p_school_id: schoolId,
        p_category_id: categoryId,
        p_status: 'rejected',
        p_user_id: user.id,
        p_reason: reason
      });
      
      if (updateError) throw updateError;
      
      // Məktəb admin ID-ni əldə edirik
      const { data: schoolAdminData, error: schoolAdminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('school_id', schoolId)
        .eq('role', 'schooladmin')
        .single();
      
      if (schoolAdminError && schoolAdminError.code !== 'PGRST116') {
        console.error('Məktəb admini tapılarkən xəta:', schoolAdminError);
      }
      
      // Məktəb admininə bildiriş göndəririk
      if (schoolAdminData && schoolAdminData.user_id) {
        await createApprovalNotification(
          schoolAdminData.user_id,
          categoryName,
          categoryId,
          false,
          reason
        );
      }
      
      toast.success(t('dataRejected'), {
        description: t('dataRejectedSuccessfully')
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Rədd prosesində xəta:', err);
      setError(err.message);
      
      toast.error(t('error'), {
        description: t('errorRejectingData')
      });
      
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  return {
    approveEntries,
    rejectEntries,
    loading,
    error
  };
};

export default useApprovalProcess;
