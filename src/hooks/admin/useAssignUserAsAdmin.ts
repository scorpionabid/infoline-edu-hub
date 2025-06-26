
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAssignUserAsAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assign school admin
  const assignSchoolAdmin = async (schoolId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('assign_school_admin', {
        user_id_param: userId,
        school_id_param: schoolId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('İstifadəçi məktəb admini olaraq təyin edildi');
      return true;
    } catch (err: any) {
      console.error('Error assigning school admin:', err);
      setError(err.message || 'Məktəb admini təyin etmə xətası');
      toast.error(err.message || 'Məktəb admini təyin etmə xətası');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign region admin
  const assignRegionAdmin = async (regionId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('assign_region_admin', {
        user_id_param: userId,
        region_id_param: regionId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('İstifadəçi region admini olaraq təyin edildi');
      return true;
    } catch (err: any) {
      console.error('Error assigning region admin:', err);
      setError(err.message || 'Region admini təyin etmə xətası');
      toast.error(err.message || 'Region admini təyin etmə xətası');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign sector admin
  const assignSectorAdmin = async (sectorId: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('assign_sector_admin', {
        user_id_param: userId,
        sector_id_param: sectorId
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('İstifadəçi sektor admini olaraq təyin edildi');
      return true;
    } catch (err: any) {
      console.error('Error assigning sector admin:', err);
      setError(err.message || 'Sektor admini təyin etmə xətası');
      toast.error(err.message || 'Sektor admini təyin etmə xətası');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    assignSchoolAdmin,
    assignRegionAdmin,
    assignSectorAdmin,
    isLoading,
    // error
  };
};
