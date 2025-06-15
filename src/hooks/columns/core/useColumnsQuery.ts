
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';

export interface UseColumnsQueryOptions {
  categoryId?: string;
  enabled?: boolean;
  includeArchived?: boolean;
  includeDeleted?: boolean;
  includeInactive?: boolean;
  status?: 'active' | 'inactive' | 'deleted' | 'all';
}

export interface ColumnsQueryOptions extends UseColumnsQueryOptions {}

export const useColumnsQuery = ({ 
  categoryId, 
  enabled = true, 
  includeArchived = false,
  includeDeleted = false,
  includeInactive = false,
  status = 'active'
}: UseColumnsQueryOptions) => {
  return useQuery({
    queryKey: ['columns', categoryId, includeArchived, includeDeleted, includeInactive, status],
    queryFn: async () => {
      console.log('🔍 Fetching columns with params:', {
        categoryId,
        includeArchived,
        includeDeleted,
        includeInactive,
        status
      });
      
      let query = supabase.from('columns').select('*');
      
      // Add category filter if provided
      if (categoryId) {
        console.log('🏷️ Adding category filter:', categoryId);
        query = query.eq('category_id', categoryId);
      }
      
      // Handle status filtering
      if (status === 'all' || includeDeleted || includeInactive || includeArchived) {
        // Include multiple statuses
        const statuses = [];
        if (status === 'all') {
          statuses.push('active', 'inactive', 'deleted');
        } else {
          statuses.push('active'); // Always include active
          if (includeInactive) statuses.push('inactive');
          if (includeDeleted) statuses.push('deleted');
          if (includeArchived) {
            statuses.push('inactive', 'deleted'); // archived includes both
          }
        }
        
        const uniqueStatuses = [...new Set(statuses)];
        console.log('🔄 Using status filter with statuses:', uniqueStatuses);
        query = query.in('status', uniqueStatuses);
      } else {
        // Default to active only
        console.log('📝 Using single status filter:', status);
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('order_index');
      
      if (error) {
        console.error('❌ Error fetching columns:', error);
        throw error;
      }
      
      console.log('✅ Fetched columns:', data?.length || 0, 'columns');
      console.log('📊 Column data:', data);
      
      return (data || []) as Column[];
    },
    enabled: enabled, // Remove categoryId dependency
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
    enabled: enabled, // Remove categoryId dependency
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
      let query = supabase.from('columns').select('*').in('status', ['inactive', 'deleted']);
      
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
    enabled: enabled, // Remove categoryId dependency
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
