
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Category, CategoryStatus } from '@/types/category';

// AddCategoryFormData tipini təyin edək
export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment?: 'sectors' | 'all';
  deadline?: Date | string;
  priority?: number;
  status?: CategoryStatus;
}

export const useCategoryOperations = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (searchQuery: string, filter: any) => {
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .ilike('name', `%${searchQuery}%`);

      if (filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      if (filter.assignment !== 'all' && filter.assignment !== '') {
        query = query.eq('assignment', filter.assignment);
      }

      if (filter.deadline === 'upcoming') {
        query = query.gt('deadline', new Date().toISOString());
      } else if (filter.deadline === 'past') {
        query = query.lt('deadline', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        const typedCategories: Category[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          assignment: (item.assignment as 'sectors' | 'all') || 'all',
          deadline: item.deadline,
          status: item.status as CategoryStatus,
          priority: item.priority || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          archived: item.archived || false,
          column_count: item.column_count || 0
        }));
        return typedCategories;
      } else {
        return [];
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorFetchingCategories'), {
        description: err.message
      });
      return [];
    }
  }, [t]);

  const addCategory = useCallback(async (newCategory: AddCategoryFormData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      
      // Form tipinin Date formatını string formatına çeviririk
      const deadline = newCategory.deadline instanceof Date 
        ? newCategory.deadline.toISOString() 
        : newCategory.deadline;
      
      const categoryToAdd = {
        name: newCategory.name,
        description: newCategory.description || '',
        assignment: newCategory.assignment || 'all',
        status: newCategory.status || 'active' as CategoryStatus,
        deadline: deadline,
        priority: newCategory.priority || 0,
        created_at: now,
        updated_at: now,
        archived: false
      };
      
      const { error } = await supabase
        .from('categories')
        .insert([categoryToAdd]);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(t('categoryAddedSuccessfully'), {
        description: t('categoryAddedSuccessfullyDesc')
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorAddingCategory'), {
        description: err.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [t]);

  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(t('categoryDeletedSuccessfully'), {
        description: t('categoryDeletedSuccessfullyDesc')
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorDeletingCategory'), {
        description: err.message
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [t]);

  return {
    isSubmitting,
    error,
    fetchCategories,
    addCategory,
    deleteCategory,
    setError
  };
};
