
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { usePermissions } from '../auth';
import { adaptDbColumnToFrontend } from './useColumnAdapters';

interface UseColumnsQueryParams {
  categoryId: string;
}

export const useColumnsQuery = ({ categoryId }: UseColumnsQueryParams) => {
  const permissions = usePermissions();

  const fetchColumns = useQuery({
    queryKey: ['columns', categoryId, permissions],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching columns:', error);
        throw new Error(error.message);
      }

      return (data as Column[]).map(adaptDbColumnToFrontend);
    },
    enabled: !!categoryId && !!permissions,
    initialData: [],
    meta: {
      errorMessage: 'Failed to load columns'
    }
  });

  return fetchColumns;
};
