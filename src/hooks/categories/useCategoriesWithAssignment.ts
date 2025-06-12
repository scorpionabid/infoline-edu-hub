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
  let query = supabase
    .from('categories')
    .select('*');

  if (userRole === 'regionadmin' && regionId) {
    query = query.eq('region_id', regionId);
  } else if (userRole === 'sectoradmin' && sectorId) {
    query = query.eq('sector_id', sectorId);
  } else if (userRole === 'schooladmin' && schoolId) {
    query = query.eq('school_id', schoolId);
  }

  const { data, error } = await query.order('order_index');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

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
