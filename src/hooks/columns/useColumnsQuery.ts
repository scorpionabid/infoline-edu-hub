
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { adaptSupabaseToColumn } from './useColumnAdapters';

/**
 * Supabase-dən sütunları çəkmək üçün istifadə edilən funksiya
 */
export const fetchColumnsFromSupabase = async (categoryId?: string) => {
  let query = supabase
    .from('columns')
    .select('*')
    .order('order_index');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  return (data || []).map(column => adaptSupabaseToColumn(column));
};

/**
 * Sütunları çəkmək üçün istifadə edilən hook
 */
export const useColumnsQuery = (categoryId?: string) => {
  return useQuery({
    queryKey: ['columns', categoryId],
    queryFn: () => fetchColumnsFromSupabase(categoryId),
  });
};
