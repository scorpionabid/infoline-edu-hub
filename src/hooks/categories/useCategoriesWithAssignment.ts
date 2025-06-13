
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { Category } from '@/types/category';

interface UseCategoriesOptions {
  enabled?: boolean;
}

interface CategoryWithAssignment extends Category {
  isAssigned: boolean;
}

const getCategories = async (userRole?: string, regionId?: string, sectorId?: string, schoolId?: string): Promise<CategoryWithAssignment[]> => {
  console.log('getCategories called with:', { userRole, regionId, sectorId, schoolId });
  
  let query = supabase
    .from('categories')
    .select(`
      *,
      columns!inner(
        id,
        name,
        type,
        is_required,
        placeholder,
        help_text,
        order_index,
        default_value,
        options,
        validation,
        status
      )
    `)
    .eq('status', 'active')
    .eq('columns.status', 'active'); // FILTER: Only active columns

  const { data, error } = await query.order('order_index');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  console.log('Fetched categories:', data?.length || 0);

  const categories = (data || []) as Category[];

  // Simulate assignment check (replace with actual logic if needed)
  const categoriesWithAssignment = categories.map(category => ({
    ...category,
    isAssigned: true // Replace with actual assignment check
  }));

  return categoriesWithAssignment;
};

export const useCategoriesWithAssignment = () => {
  const user = useAuthStore(state => state.user);
  
  return useQuery({
    queryKey: ['categories-with-assignment', user?.role, user?.region_id, user?.sector_id, user?.school_id],
    queryFn: async () => {
      return getCategories(user?.role, user?.region_id, user?.sector_id, user?.school_id);
    },
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!user
  });
};

// NEW: Export school categories specifically
export const useSchoolCategories = () => {
  const user = useAuthStore(state => state.user);
  
  return useQuery({
    queryKey: ['school-categories', user?.school_id],
    queryFn: async () => {
      console.log('useSchoolCategories - Fetching for school:', user?.school_id);
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('status', 'active')
        .eq('columns.status', 'active') // FILTER: Only active columns
        .order('order_index');
      
      if (error) {
        console.error('useSchoolCategories error:', error);
        throw error;
      }
      
      console.log('useSchoolCategories - Found categories:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  });
};

// NEW: Export sector categories specifically  
export const useSectorCategories = () => {
  const user = useAuthStore(state => state.user);
  
  return useQuery({
    queryKey: ['sector-categories', user?.sector_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('status', 'active')
        .eq('columns.status', 'active') // FILTER: Only active columns
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.sector_id,
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  });
};

// NEW: Export all categories for admin
export const useAllCategoriesForAdmin = () => {
  const user = useAuthStore(state => state.user);
  
  return useQuery({
    queryKey: ['all-categories-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(
            id,
            name,
            type,
            is_required,
            placeholder,
            help_text,
            order_index,
            default_value,
            options,
            validation,
            status
          )
        `)
        .eq('status', 'active')
        .eq('columns.status', 'active') // FILTER: Only active columns
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(user?.role === 'superadmin' || user?.role === 'regionadmin'),
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  });
};
