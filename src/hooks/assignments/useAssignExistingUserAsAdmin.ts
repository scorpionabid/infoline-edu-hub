
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface UseAssignExistingUserProps {
  onSuccess?: () => void;
}

export const useAssignExistingUserAsAdmin = (props?: UseAssignExistingUserProps) => {
  const { onSuccess } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const assignRegionAdmin = useCallback(async (userId: string, regionId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: assignError } = await supabase
        .rpc('assign_region_admin', {
          user_id_param: userId,
          region_id_param: regionId
        });

      if (assignError) throw assignError;
      
      if (!data?.success) {
        throw new Error(data?.error || t('errorAssigningAdminUnknown'));
      }

      toast.success(t('adminAssigned'), {
        description: t('regionAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return data;
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [t, onSuccess]);

  const assignSectorAdmin = useCallback(async (userId: string, sectorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: assignError } = await supabase
        .rpc('assign_sector_admin', {
          user_id_param: userId,
          sector_id_param: sectorId
        });

      if (assignError) throw assignError;
      
      if (!data?.success) {
        throw new Error(data?.error || t('errorAssigningAdminUnknown'));
      }

      toast.success(t('adminAssigned'), {
        description: t('sectorAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return data;
    } catch (err: any) {
      console.error('Error assigning sector admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [t, onSuccess]);

  const assignSchoolAdmin = useCallback(async (userId: string, schoolId: string, regionId: string, sectorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: assignError } = await supabase
        .rpc('assign_school_admin', {
          user_id_param: userId,
          school_id_param: schoolId
        });

      if (assignError) throw assignError;
      
      if (!data?.success) {
        throw new Error(data?.error || t('errorAssigningAdminUnknown'));
      }

      toast.success(t('adminAssigned'), {
        description: t('schoolAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return data;
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [t, onSuccess]);

  return {
    assignRegionAdmin,
    assignSectorAdmin,
    assignSchoolAdmin,
    isLoading,
    error
  };
};
