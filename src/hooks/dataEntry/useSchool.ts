import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/lib/supabase';
import { School } from '@/types/supabase';

/**
 * Data entry üçün məktəb məlumatlarını əldə etmək üçün hook
 * @returns {Object} Məktəb məlumatları, yüklənmə vəziyyəti və xəta
 */
export const useSchool = () => {
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // İlk olaraq istifadəçinin rolunu əldə edirik
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, school_id')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          throw new Error(roleError.message);
        }

        if (!roleData || !roleData.school_id) {
          setIsLoading(false);
          return;
        }

        // Məktəb məlumatlarını əldə edirik
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', roleData.school_id)
          .single();

        if (schoolError) {
          throw new Error(schoolError.message);
        }

        setSchool(schoolData);
      } catch (err: any) {
        console.error('Məktəb məlumatları əldə edilərkən xəta:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchool();
  }, [user]);

  return { school, isLoading, error };
};
