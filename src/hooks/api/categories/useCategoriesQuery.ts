
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CategoryWithColumns } from '@/types/category';

interface CategoryFilter {
  status?: string;
  search?: string;
}

export interface UseCategoriesQueryResult {
  categories: CategoryWithColumns[];
  loading: boolean;
  error: string | null;
  filter: CategoryFilter;
  updateFilter: (newFilter: Partial<CategoryFilter>) => void;
  createCategory: (category: Omit<CategoryWithColumns, 'id' | 'created_at' | 'updated_at'>) => Promise<CategoryWithColumns>;
  updateCategory: (id: string, updates: Partial<CategoryWithColumns>) => Promise<CategoryWithColumns>;
  deleteCategory: (id: string) => Promise<void>;
  refetch: () => void;
  // Deprecated compatibility functions
  add: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
}

export const useCategoriesQuery = (initialFilter: CategoryFilter = {}): UseCategoriesQueryResult => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<CategoryFilter>(initialFilter);

  const { data: categories = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['categories', filter],
    queryFn: async () => {
      let query = supabase.from('categories').select('*, columns(*)');
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }
      
      const { data, error } = await query.order('priority', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (categoryData: Omit<CategoryWithColumns, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create category: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CategoryWithColumns> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update category: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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
      toast.error(`Failed to delete category: ${error.message}`);
    }
  });

  const updateFilter = (newFilter: Partial<CategoryFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  return {
    categories,
    loading,
    error: error?.message || null,
    filter,
    updateFilter,
    createCategory: createMutation.mutateAsync,
    updateCategory: (id: string, updates: Partial<CategoryWithColumns>) => 
      updateMutation.mutateAsync({ id, updates }),
    deleteCategory: deleteMutation.mutateAsync,
    refetch,
    // Deprecated compatibility functions
    add: (data: any) => createMutation.mutateAsync(data),
    update: (id: string, data: any) => updateMutation.mutateAsync({ id, updates: data }),
    remove: (id: string) => deleteMutation.mutateAsync(id)
  };
};
