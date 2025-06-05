
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Category } from '@/types/category';
import { toast } from 'sonner';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useMemo } from 'react';

export interface UseCategoriesQueryProps {
  filterByUserRole?: boolean;
  includeInactive?: boolean;
}

export const useCategoriesQuery = ({
  filterByUserRole = false,
  includeInactive = false
}: UseCategoriesQueryProps = {}) => {
  const queryClient = useQueryClient();
  const user = useAuthStore(selectUser);

  // Fetch categories
  const { data: allCategories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories', { filterByUserRole, includeInactive, userRole: user?.role }],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      let query = supabase
        .from('categories')
        .select(`
          *,
          columns:columns(*)
        `)
        .order('priority', { ascending: true });

      // Add status filter if not including inactive
      if (!includeInactive) {
        query = query.neq('status', 'inactive');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CategoryWithColumns[];
    },
  });

  // Client-side filtering based on user role and assignment
  const categories = useMemo(() => {
    if (!filterByUserRole || !user) {
      return allCategories;
    }

    return allCategories.filter(category => {
      // SuperAdmin və RegionAdmin bütün kateqoriyaları görə bilər
      if (['superadmin', 'regionadmin'].includes(user.role)) {
        return true;
      }

      // SectorAdmin həm 'all' həm də 'sectors' kateqoriyalarını görə bilər
      if (user.role === 'sectoradmin') {
        return !category.assignment || category.assignment === 'all' || category.assignment === 'sectors';
      }

      // SchoolAdmin yalnız 'all' kateqoriyalarını görə bilər
      if (user.role === 'schooladmin') {
        return !category.assignment || category.assignment === 'all';
      }

      return false;
    });
  }, [allCategories, filterByUserRole, user]);

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<CategoryWithColumns> => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select(`
          *,
          columns:columns(*)
        `)
        .single();

      if (error) throw error;
      return data as CategoryWithColumns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }): Promise<CategoryWithColumns> => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          columns:columns(*)
        `)
        .single();

      if (error) throw error;
      return data as CategoryWithColumns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  return {
    categories,
    loading: isLoading,
    error: error?.message || null,
    refetch,
    createCategory: createCategoryMutation.mutateAsync,
    updateCategory: (id: string, updates: Partial<Category>) => 
      updateCategoryMutation.mutateAsync({ id, updates }),
    deleteCategory: deleteCategoryMutation.mutateAsync,
  };
};
