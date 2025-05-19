
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, formatDeadlineForApi } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export function useCategoryActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const createCategory = async (categoryData: Partial<Category>): Promise<Category | null> => {
    if (!categoryData.name) {
      toast.error(t('nameRequired'));
      return null;
    }

    setIsLoading(true);
    try {
      const deadline = categoryData.deadline ? formatDeadlineForApi(categoryData.deadline) : null;
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || '',
          status: categoryData.status || 'draft',
          assignment: categoryData.assignment || 'all',
          priority: categoryData.priority || 0,
          deadline: deadline,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('categoryCreated'));
      return data as Category;
    } catch (error: any) {
      console.error('Category creation error:', error);
      toast.error(t('errorCreatingCategory'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    setIsLoading(true);
    try {
      const deadline = categoryData.deadline ? formatDeadlineForApi(categoryData.deadline) : undefined;
      
      const { data, error } = await supabase
        .from('categories')
        .update({ 
          ...categoryData,
          deadline: deadline
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('categoryUpdated'));
      return data as Category;
    } catch (error: any) {
      console.error('Category update error:', error);
      toast.error(t('errorUpdatingCategory'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteCategory = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(t('categoryDeleted'));
      return true;
    } catch (error: any) {
      console.error('Category deletion error:', error);
      toast.error(t('errorDeletingCategory'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory
  };
}

export default useCategoryActions;
