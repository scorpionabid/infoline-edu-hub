
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedRegion {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface UseRegionsQueryResult {
  regions: EnhancedRegion[];
  loading: boolean;
  error: string | null;
  fetchRegions: () => Promise<void>;
  refresh: () => Promise<void>;
  addRegion: (regionData: any) => Promise<EnhancedRegion>;
  assignRegionAdmin: (regionId: string, userId: string) => Promise<any>;
  // Deprecated compatibility functions
  add: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
}

export const useRegionsQuery = (): UseRegionsQueryResult => {
  const queryClient = useQueryClient();

  const { data: regions = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const addRegionMutation = useMutation({
    mutationFn: async (regionData: any) => {
      const { data, error } = await supabase
        .from('regions')
        .insert([regionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast.success('Region created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create region: ${error.message}`);
    }
  });

  const assignAdminMutation = useMutation({
    mutationFn: async ({ regionId, userId }: { regionId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', regionId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, message: 'Region admin təyin edildi' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast.success('Region admin assigned successfully');
    }
  });

  const fetchRegions = async () => {
    await refetch();
  };

  const refresh = async () => {
    await refetch();
  };

  return {
    regions,
    loading,
    error: error?.message || null,
    fetchRegions,
    refresh,
    addRegion: addRegionMutation.mutateAsync,
    assignRegionAdmin: (regionId: string, userId: string) => 
      assignAdminMutation.mutateAsync({ regionId, userId }),
    // Deprecated compatibility functions
    add: (data: any) => addRegionMutation.mutateAsync(data),
    update: async (id: string, data: any) => {
      const { error } = await supabase.from('regions').update(data).eq('id', id);
      if (error) throw error;
      return true;
    },
    remove: async (id: string) => {
      const { error } = await supabase.from('regions').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  };
};
