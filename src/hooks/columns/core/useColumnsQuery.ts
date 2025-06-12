import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: async () => {
      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }
      
      return (data || []) as Column[];
    },
    enabled: enabled && !!categoryId,
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    throwOnError: true // Modern API instead of onError
  });
};

interface UseActiveColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
}

export const useActiveColumnsQuery = ({ categoryId, enabled = true }: UseActiveColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['active-columns', categoryId],
    queryFn: async () => {
      let query = supabase.from('columns').select('*').eq('status', 'active');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Error fetching active columns:', error);
        throw error;
      }
      
      return (data || []) as Column[];
    },
    enabled: enabled && !!categoryId,
    gcTime: 5 * 60 * 1000,
    staleTime: 30 * 1000,
    retry: 2,
    throwOnError: true
  });
};
