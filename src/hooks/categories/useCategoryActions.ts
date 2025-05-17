import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryStatus } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryActions = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: Partial<Category>): Promise<Category | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      toast.success(t('categoryCreated'));
      return data as Category;
    } catch (err) {
      console.error('Error creating category:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessage = (err as Error).message || 'Error creating category';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast.success(t('categoryUpdated'));
      return data as Category;
    } catch (err) {
      console.error('Error updating category:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessage = (err as Error).message || 'Error updating category';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryStatus = async (id: string, status: CategoryStatus): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('categories')
        .update({ status })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      toast.success(t('categoryStatusUpdated'));
      return true;
    } catch (err) {
      console.error('Error updating category status:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessage = (err as Error).message || 'Error updating category status';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      toast.success(t('categoryDeleted'));
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      if (typeof err === 'object' && err !== null) {
        const errorMessage = (err as Error).message || 'Error deleting category';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createCategories = async (categories: AddCategoryFormData[]) => {
    try {
      // Ensure each category has the required 'name' field
      const validCategories = categories.filter(cat => !!cat.name);
      
      if (validCategories.length === 0) {
        throw new Error('At least one category with a valid name is required');
      }
      
      // Add timestamps to each category
      const categoriesWithTimestamps = validCategories.map(cat => ({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesWithTimestamps)
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating categories:', error);
      return { success: false, error };
    }
  };

  return {
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    createCategories,
    isLoading,
    error
  };
};

export default useCategoryActions;

export interface AddCategoryFormData {
  name: string;
  description?: string;
  deadline?: string | Date;
  status?: CategoryStatus;
  priority?: number;
  assignment?: string;
}
