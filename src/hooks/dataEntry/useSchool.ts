
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  email?: string;
  phone?: string;
  status: string;
}

export const useSchool = (schoolId?: string) => {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Əgər schoolId verilmirsə, istifadəçinin aid olduğu məktəbi götürürük
        const targetSchoolId = schoolId || user?.school_id;
        
        if (!targetSchoolId) {
          setIsLoading(false);
          return;
        }
        
        const { data, error: fetchError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', targetSchoolId)
          .single();
        
        if (fetchError) throw fetchError;
        
        setSchool(data as School);
      } catch (err: any) {
        console.error('Məktəb məlumatlarını yükləyərkən xəta:', err);
        setError(err.message);
        toast.error('Məktəb məlumatları yüklənmədi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchool();
  }, [schoolId, user]);

  return { school, isLoading, error };
};
