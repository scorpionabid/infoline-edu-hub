
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguageSafe } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useAssignUserAsAdmin = () => {
  const { t } = useLanguageSafe();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const assignSchoolAdmin = async (userId: string, schoolId: string) => {
    if (!userId || !schoolId) {
      setError(t('missingRequiredFields'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the assign_school_admin RPC function
      const { error: rpcError } = await supabase.rpc('assign_school_admin', {
        p_user_id: userId,
        p_school_id: schoolId
      });

      if (rpcError) throw rpcError;

      setSuccess(true);
      toast.success(t('schoolAdminAssignmentSuccess'));
      return true;
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message);
      toast.error(t('schoolAdminAssignmentError'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignSectorAdmin = async (userId: string, sectorId: string) => {
    if (!userId || !sectorId) {
      setError(t('missingRequiredFields'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the assign_sector_admin RPC function
      const { error: rpcError } = await supabase.rpc('assign_sector_admin', {
        p_user_id: userId,
        p_sector_id: sectorId
      });

      if (rpcError) throw rpcError;

      setSuccess(true);
      toast.success(t('sectorAdminAssignmentSuccess'));
      return true;
    } catch (err: any) {
      console.error('Error assigning sector admin:', err);
      setError(err.message);
      toast.error(t('sectorAdminAssignmentError'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const assignRegionAdmin = async (userId: string, regionId: string) => {
    if (!userId || !regionId) {
      setError(t('missingRequiredFields'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the assign_region_admin RPC function with correct parameter type
      const { error: rpcError } = await supabase.rpc('assign_region_admin' as any, {
        p_user_id: userId,
        p_region_id: regionId
      });

      if (rpcError) throw rpcError;

      setSuccess(true);
      toast.success(t('regionAdminAssignmentSuccess'));
      return true;
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      setError(err.message);
      toast.error(t('regionAdminAssignmentError'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    assignSchoolAdmin,
    assignSectorAdmin,
    assignRegionAdmin,
    loading,
    success,
    error,
    resetState
  };
};
