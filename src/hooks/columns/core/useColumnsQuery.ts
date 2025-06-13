
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

export interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
  includeArchived?: boolean;
}

export interface ColumnsQueryOptions extends UseColumnsQueryOptions {}

export const useColumnsQuery = ({ categoryId, enabled = true, includeArchived = false }: UseColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['columns', categoryId, includeArchived],
    queryFn: async () => {
      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (!includeArchived) {
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Error fetching columns:', error);
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

export const useActiveColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
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

export const useArchivedColumnsQuery = ({ categoryId, enabled = true }: UseColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['archived-columns', categoryId],
    queryFn: async () => {
      let query = supabase.from('columns').select('*').eq('status', 'archived');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('Error fetching archived columns:', error);
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

export const useColumnQuery = ({ columnId, enabled = true }: { columnId?: string; enabled?: boolean }) => {
  return useQuery({
    queryKey: ['column', columnId],
    queryFn: async () => {
      if (!columnId) return null;
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();
      
      if (error) {
        console.error('Error fetching column:', error);
        throw error;
      }
      
      return data as Column;
    },
    enabled: enabled && !!columnId,
    gcTime: 5 * 60 * 1000,
    staleTime: 30 * 1000,
    retry: 2,
    throwOnError: true
  });
};
