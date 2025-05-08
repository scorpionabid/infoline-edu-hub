
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { adaptDbColumnToFrontend } from './useColumnAdapters';

export const useColumnQuery = (categoryId: string | null) => {
  const { toast } = useToast();
  const permissions = usePermissions();
  
  return useQuery({
    queryKey: ['columns', categoryId, permissions],
    queryFn: async (): Promise<Column[]> => {
      if (!categoryId) {
        return [];
      }

      try {
        // Fetch columns for the category
        const { data, error } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', categoryId)
          .order('order_index', { ascending: true });

        if (error) {
          throw error;
        }

        // Convert database columns to frontend format
        const columns: Column[] = data.map(adaptDbColumnToFrontend);
        return columns;
      } catch (error: any) {
        console.error('Error fetching columns:', error);
        throw error;
      }
    },
    enabled: !!categoryId,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Error fetching columns',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });
};

export const useColumnsByCategory = (categoryId: string | null) => {
  const result = useColumnQuery(categoryId);
  
  return {
    ...result,
    columns: result.data || [],
  };
};
