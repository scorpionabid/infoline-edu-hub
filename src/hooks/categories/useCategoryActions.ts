
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, CategoryStatus } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext'; 

const useCategoryActions = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const createCategory = async (categoryData: Partial<Category>) => {
    setIsLoading(true);
    try {
      // Convert Date objects to ISO strings for Supabase
      const processedData = {
        ...categoryData,
        deadline: categoryData.deadline instanceof Date ? 
          categoryData.deadline.toISOString() : categoryData.deadline
      };

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: processedData.name || '',
          description: processedData.description,
          status: processedData.status || 'active',
          assignment: processedData.assignment || 'all',
          deadline: processedData.deadline,
          priority: processedData.priority
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(t('categoryCreated'));
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(t('errorCreatingCategory'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    setIsLoading(true);
    try {
      // Convert Date objects to ISO strings for Supabase
      const processedData = {
        ...categoryData,
        deadline: categoryData.deadline instanceof Date ? 
          categoryData.deadline.toISOString() : categoryData.deadline
      };
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: processedData.name,
          description: processedData.description,
          status: processedData.status,
          assignment: processedData.assignment,
          deadline: processedData.deadline,
          priority: processedData.priority
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('categoryUpdated'));
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(t('errorUpdatingCategory'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success(t('categoryDeleted'));
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(t('errorDeletingCategory'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoryStatus = async (id: string, status: CategoryStatus) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success(t('statusUpdated'));
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating category status:', error);
      toast.error(t('errorUpdatingStatus'), {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
    isLoading
  };
};

export default useCategoryActions;
