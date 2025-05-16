
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, CategoryStatus } from '@/types/category';

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment?: string;
  deadline?: Date | null;
  priority?: number;
}

export const useCategoryOperations = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateCategoryStatus = useCallback(async (id: string, status: CategoryStatus) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Category status updated to ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const archiveCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          archived: true,
          status: 'archived' as CategoryStatus
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Category archived successfully');
      return true;
    } catch (error) {
      console.error('Error archiving category:', error);
      toast.error('Failed to archive category');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // First, delete related columns
      const { error: columnsError } = await supabase
        .from('columns')
        .delete()
        .eq('category_id', id);

      if (columnsError) throw columnsError;

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Category deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async (searchQuery: string, filters: any) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      // Search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (categoryData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();

      if (error) throw error;
      toast.success('Category added successfully');
      return data?.[0];
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    fetchCategories,
    addCategory,
    updateCategoryStatus,
    archiveCategory,
    deleteCategory
  };
};
