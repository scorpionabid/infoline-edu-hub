
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useAssignExistingUserAsSchoolAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const assignUserAsSchoolAdmin = useCallback(async (schoolId: string, userId: string) => {
    try {
      setLoading(true);
      
      // Update user role
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'schooladmin',
          school_id: schoolId,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success(t('adminAssignedSuccessfully') || 'Admin assigned successfully');
      return { success: true };
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign admin');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [t]);

  return {
    assignUserAsSchoolAdmin,
    loading
  };
};
