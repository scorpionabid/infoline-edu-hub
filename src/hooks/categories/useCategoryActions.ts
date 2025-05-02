
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryActions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { t } = useLanguage();

  // Kateqoriya yaratmaq
  const createCategory = async (category: Omit<Category, 'id'>) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: err } = await supabase
        .from('categories')
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived: false
        })
        .select();

      if (err) {
        setError(err.message);
        toast.error(t('errorCreatingCategory'));
        return { success: false, error: err.message };
      }

      toast.success(t('categoryCreated'));
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorCreatingCategory'));
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Kateqoriya yeniləmək
  const updateCategory = async (category: Omit<Category, 'id'> & { id: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: err } = await supabase
        .from('categories')
        .update({
          ...category,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select();

      if (err) {
        setError(err.message);
        toast.error(t('errorUpdatingCategory'));
        return { success: false, error: err.message };
      }

      toast.success(t('categoryUpdated'));
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorUpdatingCategory'));
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Kateqoriya silmək (arxivləmək)
  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { error: err } = await supabase
        .from('categories')
        .update({
          archived: true,
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (err) {
        setError(err.message);
        toast.error(t('errorDeletingCategory'));
        return { success: false, error: err.message };
      }

      toast.success(t('categoryDeleted'));
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorDeletingCategory'));
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Kateqoriyanın statusunu dəyişdirmək
  const updateCategoryStatus = async (categoryId: string, status: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: err } = await supabase
        .from('categories')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)
        .select();

      if (err) {
        setError(err.message);
        toast.error(t('errorUpdatingCategoryStatus'));
        return { success: false, error: err.message };
      }

      toast.success(t('categoryStatusUpdated'));
      return { success: true, data };
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorUpdatingCategoryStatus'));
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
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
