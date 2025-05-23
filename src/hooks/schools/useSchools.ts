
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name');

        if (error) throw error;
        setSchools(data || []);
      } catch (err) {
        console.error('Error fetching schools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  return {
    schools,
    loading
  };
};
