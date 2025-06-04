
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo_url?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      if (error) throw error;
      setSchools(data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Məktəbləri yükləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const deleteSchool = async (schoolId: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', schoolId);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.id !== schoolId));
      toast.success('Məktəb uğurla silindi');
    } catch (error) {
      console.error('Error deleting school:', error);
      toast.error('Məktəb silinərkən xəta baş verdi');
      throw error;
    }
  };

  return {
    schools,
    loading,
    isLoading: loading,
    isError: false,
    error: null as any,
    refetch: fetchSchools,
    deleteSchool
  };
};
