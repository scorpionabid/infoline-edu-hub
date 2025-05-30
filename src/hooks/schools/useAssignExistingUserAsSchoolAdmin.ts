
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/common/useToast';

export const useAssignExistingUserAsSchoolAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const assignSchoolAdmin = async (userId: string, schoolId: string) => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase.rpc('assign_school_admin', {
        user_id_param: userId,
        school_id_param: schoolId
      });

      if (dbError) throw dbError;

      // Check if the response indicates success
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          success('Məktəb admini uğurla təyin edildi');
          return data;
        } else {
          throw new Error(data.error || 'Təyin edilərkən xəta baş verdi');
        }
      }

      success('Məktəb admini uğurla təyin edildi');
      return data;
    } catch (err: any) {
      error('Admin təyin edilərkən xəta baş verdi');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add the missing method for backward compatibility
  const assignUserAsSchoolAdmin = assignSchoolAdmin;

  return {
    assignSchoolAdmin,
    assignUserAsSchoolAdmin,
    loading
  };
};

export default useAssignExistingUserAsSchoolAdmin;
