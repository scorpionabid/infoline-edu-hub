
import { useEffect } from 'react';
import { useRegionsQuery } from './regions/useRegionsQuery';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

/**
 * @deprecated Please use useRegionsQuery or useRegionsStore instead.
 * This hook is maintained for backwards compatibility.
 */
export const useRegions = () => {
  const { t } = useLanguage();
  console.warn('useRegions hook is deprecated, please use useRegionsQuery or useRegionsStore instead');
  
  // Use the new implementation internally
  const {
    regions,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useRegionsQuery();
  
  // Format error to match the old API
  const error = queryError ? (queryError as Error).message : '';

  // Create compatible API with the old hook
  const fetchRegions = async () => {
    try {
      await refetch();
    } catch (err: any) {
      console.error('Error fetching regions:', err);
      toast.error(t('errorLoadingRegions'));
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const addRegion = async (regionData: any) => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select();

      if (error) throw error;
      
      // Refresh data
      await refetch();
      
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding region:', err);
      toast.error(t('errorAddingRegion'));
      return { success: false, error: err.message };
    }
  };

  const assignRegionAdmin = async (regionId: string, userId: string) => {
    try {
      const { error } = await supabase.rpc('assign_region_admin', {
        p_region_id: regionId,
        p_user_id: userId
      });

      if (error) throw error;
      
      // Refresh data
      await refetch();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      toast.error(t('errorAssigningRegionAdmin'));
      return { success: false, error: err.message };
    }
  };

  // Preserve the original API
  return {
    regions,
    loading,
    error,
    fetchRegions,
    refresh: fetchRegions,
    addRegion,
    assignRegionAdmin,
  };
};

// Re-import for compatibility in this file
import { supabase } from '@/integrations/supabase/client';
