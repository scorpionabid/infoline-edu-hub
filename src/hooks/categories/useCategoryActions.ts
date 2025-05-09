
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryStatus } from '@/types/category';
import { toast } from '@/components/ui/use-toast';

export const useCategoryActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      
      return { ...data, success: true };
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to create category',
        variant: 'destructive',
      });
      
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
      
      return { ...data, success: true };
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to update category',
        variant: 'destructive',
      });
      
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete category',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryStatus = async (id: string, status: CategoryStatus) => {
    return updateCategory(id, { status });
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
    isLoading,
    error
  };
};

export default useCategoryActions;
