
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

      // Using a direct query instead of RPC for better type compatibility
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let result;
      
      if (!existingRole) {
        // Insert new role if it doesn't exist
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'regionadmin',
            region_id: regionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
        result = { success: true };
      } else {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            role: 'regionadmin', 
            region_id: regionId,
            sector_id: null,
            school_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
        result = { success: true };
      }

      toast.success(t('adminAssigned'), {
        description: t('regionAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return result;
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [t, onSuccess]);

  const assignSectorAdmin = useCallback(async (userId: string, sectorId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Using a direct query instead of RPC
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      let result;
      
      if (!existingRole) {
        // Get region_id for this sector
        const { data: sectorData, error: sectorError } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', sectorId)
          .single();
          
        if (sectorError) throw sectorError;
        
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'sectoradmin',
            sector_id: sectorId,
            region_id: sectorData.region_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
        result = { success: true };
      } else {
        // Get region_id for this sector
        const { data: sectorData, error: sectorError } = await supabase
          .from('sectors')
          .select('region_id')
          .eq('id', sectorId)
          .single();
          
        if (sectorError) throw sectorError;
        
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            role: 'sectoradmin', 
            sector_id: sectorId,
            region_id: sectorData.region_id,
            school_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
        result = { success: true };
      }

      toast.success(t('adminAssigned'), {
        description: t('sectorAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return result;
    } catch (err: any) {
      console.error('Error assigning sector admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [t, onSuccess]);

  const assignSchoolAdmin = useCallback(async (userId: string, schoolId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Using a direct query instead of RPC
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // Get school data to get region_id and sector_id
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('region_id, sector_id')
        .eq('id', schoolId)
        .single();
        
      if (schoolError) throw schoolError;
      
      let result;
      
      if (!existingRole) {
        // Insert new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: 'schooladmin',
            school_id: schoolId,
            sector_id: schoolData.sector_id,
            region_id: schoolData.region_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) throw insertError;
        result = { success: true };
      } else {
        // Update existing role
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            role: 'schooladmin', 
            school_id: schoolId,
            sector_id: schoolData.sector_id,
            region_id: schoolData.region_id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
          
        if (updateError) throw updateError;
        result = { success: true };
      }

      toast.success(t('adminAssigned'), {
        description: t('schoolAdminAssignSuccess')
      });
      
      if (onSuccess) onSuccess();
      
      return result;
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message || t('errorAssigningAdmin'));
      
      toast.error(t('errorAssigningAdmin'), {
        description: err.message
      });
      
      return { success: false, error: err.message };
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
