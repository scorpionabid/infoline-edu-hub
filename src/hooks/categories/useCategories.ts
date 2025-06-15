
/**
 * UNIFIED CATEGORY HOOKS - All category operations consolidated
 * This replaces the previous scattered category hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { Category, AddCategoryFormData, formatDeadlineForApi } from '@/types/category';
import { toast } from 'sonner';

interface UseCategoriesOptions {
  enabled?: boolean;
  assignment?: 'all' | 'schools' | 'sectors' | 'regions';
}

interface CategoryWithAssignment extends Category {
  isAssigned: boolean;
}

// MAIN CATEGORIES QUERY HOOK
export const useCategories = (options: UseCategoriesOptions = {}) => {
  const { enabled = true, assignment } = options;
  const user = useAuthStore(state => state.user);
  
  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', assignment, user?.role, user?.region_id, user?.sector_id, user?.school_id],
    queryFn: async (): Promise<Category[]> => {
      console.log('🔍 useCategories - Fetching categories with options:', { assignment, userRole: user?.role });
      
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
        .eq('columns.status', 'active')
        .order('order_index');

      // Apply assignment filter if specified
      if (assignment && assignment !== 'all') {
        query = query.in('assignment', [assignment, 'all']);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      // Type casting to ensure proper types
      const typedData: Category[] = (data || []).map(item => ({
        ...item,
        assignment: item.assignment as 'all' | 'schools' | 'sectors' | 'regions',
        status: item.status as 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending',
        column_count: item.columns?.length || 0,
        completion_rate: 0, // Default value
        completionRate: 0 // Alternative field name
      }));

      console.log('✅ Fetched categories:', typedData.length);
      return typedData;
    },
    enabled: enabled && !!user,
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  });

  return {
    categories,
    loading,
    error: error as Error | null,
    refetch
  };
};

// CATEGORY MUTATIONS HOOK
export const useCategoryOperations = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (categoryData: AddCategoryFormData): Promise<Category> => {
      const dataToInsert = {
        ...categoryData,
        deadline: formatDeadlineForApi(categoryData.deadline),
        status: categoryData.status || 'active',
        assignment: categoryData.assignment || 'all',
        order_index: categoryData.order_index ?? 0
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      
      // Type casting for response
      return {
        ...data,
        assignment: data.assignment as 'all' | 'schools' | 'sectors' | 'regions',
        status: data.status as 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla yaradıldı');
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
    }
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AddCategoryFormData> }): Promise<Category> => {
      const updateData = {
        ...updates,
        deadline: updates.deadline ? formatDeadlineForApi(updates.deadline) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Type casting for response
      return {
        ...data,
        assignment: data.assignment as 'all' | 'schools' | 'sectors' | 'regions',
        status: data.status as 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending'
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya uğurla yeniləndi');
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kateqoriya silindi');
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Kateqoriya silinərkən xəta baş verdi');
    }
  });

  return {
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    createCategoryAsync: createCategory.mutateAsync,
    updateCategoryAsync: updateCategory.mutateAsync,
    deleteCategoryAsync: deleteCategory.mutateAsync,
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
    createError: createCategory.error,
    updateError: updateCategory.error,
    deleteError: deleteCategory.error
  };
};

// SPECIFIC ASSIGNMENT HOOKS
export const useSchoolCategories = () => useCategories({ assignment: 'schools' });
export const useSectorCategories = () => useCategories({ assignment: 'sectors' });
export const useAllCategoriesForAdmin = () => useCategories({ assignment: 'all' });

// BACKWARD COMPATIBILITY - Legacy hook names
export const useCategoriesWithAssignment = () => useCategories();
export const useCategoryActions = () => useCategoryOperations();
