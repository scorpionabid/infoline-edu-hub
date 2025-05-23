
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface School {
  id: string;
  name: string;
  sector_id: string;
  region_id: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  principal_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  type?: string;
  language?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface UseSchoolsQueryResult {
  schools: School[];
  loading: boolean;
  addSchool: (newSchoolData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => Promise<{ success: boolean; data: School[]; error?: undefined } | { success: boolean; error: any; data?: undefined }>;
  updateSchool: (id: string, updates: Partial<School>) => Promise<any>;
  deleteSchool: (id: string) => Promise<any>;
  fetchSchools: () => Promise<any>;
  fetchSchoolsBySector: (sectorId: string) => Promise<any>;
  refresh: () => Promise<any>;
  // Deprecated compatibility functions
  add: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
  error: string | null;
}

export const useSchoolsQuery = (): UseSchoolsQueryResult => {
  const queryClient = useQueryClient();

  const { data: schools = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const addSchoolMutation = useMutation({
    mutationFn: async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([{ ...schoolData, completion_rate: 0 }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create school: ${error.message}`);
    }
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<School> }) => {
      const { data, error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
    }
  });

  const deleteSchoolMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
    }
  });

  const addSchool = async (newSchoolData: Omit<School, 'id' | 'created_at' | 'updated_at' | 'completion_rate'>) => {
    try {
      const result = await addSchoolMutation.mutateAsync(newSchoolData);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    schools,
    loading,
    error: error?.message || null,
    addSchool,
    updateSchool: (id: string, updates: Partial<School>) => 
      updateSchoolMutation.mutateAsync({ id, updates }),
    deleteSchool: deleteSchoolMutation.mutateAsync,
    fetchSchools: refetch,
    fetchSchoolsBySector: async (sectorId: string) => refetch(),
    refresh: refetch,
    // Deprecated compatibility functions
    add: (data: any) => addSchoolMutation.mutateAsync(data),
    update: (id: string, data: any) => updateSchoolMutation.mutateAsync({ id, updates: data }),
    remove: (id: string) => deleteSchoolMutation.mutateAsync(id)
  };
};
