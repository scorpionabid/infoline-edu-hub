
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Category, CategoryStatus } from '@/types/category';
import { toast } from 'sonner';

export interface UseCategoriesOptions {
  initialFilter?: { 
    status?: CategoryStatus;
    search?: string;
  }
  enabled?: boolean;
}

export const useCategories = (options?: UseCategoriesOptions) => {
  const { initialFilter, enabled = true } = options || {};

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories with filter:', initialFilter);
      let query = supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter if provided
      if (initialFilter?.status) {
        query = query.eq('status', initialFilter.status);
      }
      
      // Apply search filter if provided
      if (initialFilter?.search) {
        query = query.ilike('name', `%${initialFilter.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error(error.message);
      }

      console.log(`Fetched ${data?.length} categories`);
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
    enabled
  });

  return {
    categories: data || [],
    isLoading,
    error,
    refetch
  };
};

export default useCategories;
