
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  admin_id?: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  type?: string;
  language?: string;
  logo?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export const useSchools = (regionId?: string, sectorId?: string) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('schools').select('*');
        
        if (regionId) {
          query = query.eq('region_id', regionId);
        }
        
        if (sectorId) {
          query = query.eq('sector_id', sectorId);
        }

        const { data, error: fetchError } = await query.order('name');

        if (fetchError) throw fetchError;

        // Type assertion with proper status casting
        const typedSchools = (data || []).map(school => ({
          ...school,
          status: (school.status === 'active' || school.status === 'inactive') 
            ? school.status 
            : 'active' as 'active' | 'inactive'
        })) as School[];

        setSchools(typedSchools);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schools');
        console.error('Error fetching schools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [regionId, sectorId]);

  const createSchool = async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{
          ...schoolData,
          status: schoolData.status || 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSchool = {
          ...data,
          status: (data.status === 'active' || data.status === 'inactive') 
            ? data.status 
            : 'active' as 'active' | 'inactive'
        } as School;

        setSchools(prev => [newSchool, ...prev]);
        return newSchool;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create school');
      throw err;
    }
  };

  const updateSchool = async (id: string, updates: Partial<School>) => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedSchool = {
          ...data,
          status: (data.status === 'active' || data.status === 'inactive') 
            ? data.status 
            : 'active' as 'active' | 'inactive'
        } as School;

        setSchools(prev => prev.map(school => 
          school.id === id ? updatedSchool : school
        ));
        return updatedSchool;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update school');
      throw err;
    }
  };

  const deleteSchool = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete school');
      throw err;
    }
  };

  return {
    schools,
    loading,
    error,
    createSchool,
    updateSchool,
    deleteSchool,
    refreshSchools: () => {
      setLoading(true);
      // Re-trigger the effect by updating a dependency
    }
  };
};
