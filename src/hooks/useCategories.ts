
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Category, CategoryStatus } from '@/types/category';
import { toast } from 'sonner';

export const useCategories = (initialFilter?: { status?: CategoryStatus } ) => {
  const fetchCategories = async () => {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter if provided
      if (initialFilter?.status) {
        query = query.eq('status', initialFilter.status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Category[];
    } catch (error) {
      if (error instanceof Error) {
        toast.error('Failed to fetch categories: ' + error.message);
      }
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['categories', initialFilter],
    queryFn: fetchCategories,
  });

  return {
    categories: data || [],
    isLoading,
    error,
    refetch
  };
};

export default useCategories;
