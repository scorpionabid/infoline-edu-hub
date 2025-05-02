
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export interface UseCategoryActionsProps {
  onSuccess?: () => void;
}

export const useCategoryActions = (props?: UseCategoryActionsProps) => {
  const { onSuccess } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Kateqoriya yaratma
  const createCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: createError } = await supabase
          .from('categories')
          .insert([
            {
              name: category.name,
              description: category.description,
              assignment: category.assignment,
              status: category.status || 'active',
              priority: category.priority || 0,
              deadline: category.deadline ? new Date(category.deadline).toISOString() : null,
              archived: false
            }
          ])
          .select();

        if (createError) throw createError;
        
        toast.success(t('categoryCreated'), {
          description: t('categoryCreateSuccess')
        });
        
        if (onSuccess) onSuccess();
        
        return data?.[0];
      } catch (err: any) {
        console.error('Error creating category:', err);
        setError(err.message || t('errorCreatingCategory'));
        
        toast.error(t('errorCreatingCategory'), {
          description: err.message
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [t, onSuccess]
  );

  // Kateqoriya yeniləmə
  const updateCategory = useCallback(
    async (category: Omit<Category, 'id'> & { id: string }) => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: updateError } = await supabase
          .from('categories')
          .update({
            name: category.name,
            description: category.description,
            assignment: category.assignment,
            status: category.status,
            priority: category.priority || 0,
            deadline: category.deadline ? new Date(category.deadline).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id)
          .select();

        if (updateError) throw updateError;
        
        toast.success(t('categoryUpdated'), {
          description: t('categoryUpdateSuccess')
        });
        
        if (onSuccess) onSuccess();
        
        return data?.[0];
      } catch (err: any) {
        console.error('Error updating category:', err);
        setError(err.message || t('errorUpdatingCategory'));
        
        toast.error(t('errorUpdatingCategory'), {
          description: err.message
        });
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [t, onSuccess]
  );

  // Kateqoriya silmə
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Faktiki silmək əvəzinə arxivləşdiririk
        const { error: deleteError } = await supabase
          .from('categories')
          .update({ archived: true, status: 'inactive' })
          .eq('id', categoryId);

        if (deleteError) throw deleteError;
        
        toast.success(t('categoryDeleted'), {
          description: t('categoryDeleteSuccess')
        });
        
        if (onSuccess) onSuccess();
        
        return true;
      } catch (err: any) {
        console.error('Error deleting category:', err);
        setError(err.message || t('errorDeletingCategory'));
        
        toast.error(t('errorDeletingCategory'), {
          description: err.message
        });
        
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [t, onSuccess]
  );

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error
  };
};
