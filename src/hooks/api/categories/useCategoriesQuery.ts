
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

  // Fetch categories with columns
  const { data: allCategories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories', { filterByUserRole, includeInactive, userRole: user?.role }],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      console.log('Fetching categories with role filtering:', { filterByUserRole, userRole: user?.role });
      
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

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No categories found');
        return [];
      }

      console.log(`Fetched ${data.length} categories from database`);
      return data as CategoryWithColumns[];
    },
  });

  // Client-side filtering artıq lazım deyil çünki RLS policy-lər database səviyyəsində filtrasiya edir
  const categories = useMemo(() => {
    if (!filterByUserRole || !user) {
      return allCategories;
    }

    // Database-də artıq RLS policy-lər var, ona görə əlavə filtrasiya lazım deyil
    // Amma debug üçün log əlavə edək
    console.log(`User role: ${user.role}, Categories count: ${allCategories.length}`);
    
    return allCategories;
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
