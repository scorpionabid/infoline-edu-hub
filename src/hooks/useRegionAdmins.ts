
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useRegionAdmins = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const assignAdmin = useCallback(async (userId: string, regionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Əvvəlcə istifadəçini region_admin olaraq qeyd etmək
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          region_id: regionId,
          role: 'regionadmin'
        });

      if (roleError) throw roleError;

      // Region cədvəlində admin_id sahəsini yeniləmək
      const { error: regionError } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', regionId);

      if (regionError) throw regionError;

      toast.success(t('adminAssignedSuccessfully'));
      return { success: true };
    } catch (err: any) {
      console.error('Admin təyin edilməsi xətası:', err);
      setError(err.message);
      toast.error(t('errorAssigningAdmin'));
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [t]);

  return { assignAdmin, loading, error };
};
