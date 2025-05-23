
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface UseSectorsQueryResult {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
  fetchSectors: () => Promise<void>;
  fetchSectorsByRegion: (regionId: string) => Promise<void>;
  refresh: () => Promise<void>;
  // Deprecated compatibility functions
  add: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
}

export const useSectorsQuery = (): UseSectorsQueryResult => {
  const queryClient = useQueryClient();

  const { data: sectors = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const addSectorMutation = useMutation({
    mutationFn: async (sectorData: any) => {
      const { data, error } = await supabase
        .from('sectors')
        .insert([sectorData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create sector: ${error.message}`);
    }
  });

  const fetchSectors = async () => {
    await refetch();
  };

  const fetchSectorsByRegion = async (regionId: string) => {
    // This would typically filter by region, but for simplicity we'll refetch all
    await refetch();
  };

  const refresh = async () => {
    await refetch();
  };

  return {
    sectors,
    loading,
    error: error?.message || null,
    fetchSectors,
    fetchSectorsByRegion,
    refresh,
    // Deprecated compatibility functions
    add: (data: any) => addSectorMutation.mutateAsync(data),
    update: async (id: string, data: any) => {
      const { error } = await supabase.from('sectors').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from('sectors').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };
};
