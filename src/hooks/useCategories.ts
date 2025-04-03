import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Category, adaptSupabaseCategory, CategoryWithOrder } from '@/types/category';

// Əsas useCategories hook
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      console.log('Kateqoriyalar sorğusu göndərilir...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority');

      if (error) throw error;
      
      console.log('Kateqoriyalar uğurla əldə edildi:', data);
      
      // Adapter vasitəsi ilə məlumatları daha təhlükəsiz çeviririk
      const formattedCategories = data.map(category => adaptSupabaseCategory(category));
      console.log('Formatlanmış kateqoriyalar:', formattedCategories);
      
      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadCategories')
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Convert the frontend model to Supabase format
      const supabaseCategory = {
        name: category.name,
        description: category.description,
        assignment: category.assignment,
        priority: category.priority,
        deadline: category.deadline ? (typeof category.deadline === 'object' ? category.deadline.toISOString() : category.deadline) : null,
        status: category.status || 'active',
        order: category.order || category.priority,
        archived: category.archived || false
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([supabaseCategory])
        .select()
        .single();

      if (error) throw error;
      
      const newCategory = adaptSupabaseCategory(data);
      setCategories(prev => [...prev, newCategory]);
      
      toast.success(t('categoryAdded'), {
        description: t('categoryAddedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error adding category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddCategory')
      });
      throw err;
    }
  };

  const updateCategory = async (updates: CategoryWithOrder) => {
    try {
      // Convert the frontend model updates to Supabase format
      const supabaseUpdates = {
        name: updates.name,
        description: updates.description,
        assignment: updates.assignment,
        priority: updates.priority,
        deadline: typeof updates.deadline === 'object' ? updates.deadline.toISOString() : updates.deadline,
        status: updates.status,
        order: updates.order || updates.priority,
        archived: updates.archived
      };

      const { data, error } = await supabase
        .from('categories')
        .update(supabaseUpdates)
        .eq('id', updates.id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedCategory = adaptSupabaseCategory(data);
      setCategories(prev => prev.map(category => 
        category.id === updates.id ? updatedCategory : category
      ));
      
      toast.success(t('categoryUpdated'), {
        description: t('categoryUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Error updating category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateCategory')
      });
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(category => category.id !== id));
      
      toast.success(t('categoryDeleted'), {
        description: t('categoryDeletedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteCategory')
      });
      throw err;
    }
  };
  
  const refetch = fetchCategories;

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading: loading,
    isError: !!error,
    categoriesCount: categories.length,
    updateCategoryStatus: updateCategory,
    refetch
  };
};

// Əlavə əməliyyatlar üçün hook
export const useCategoryOperations = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const addCategory = async (category: CategoryWithOrder) => {
    setLoading(true);
    try {
      // Supabase formatına çeviririk
      const supabaseCategory = {
        name: category.name,
        description: category.description,
        assignment: category.assignment,
        priority: category.priority,
        deadline: typeof category.deadline === 'object' ? category.deadline.toISOString() : category.deadline,
        status: category.status || 'active',
        order: category.order || category.priority,
        archived: category.archived || false
      };

      const { error } = await supabase
        .from('categories')
        .insert([supabaseCategory]);

      if (error) throw error;
      
      toast.success(t('categoryAdded'), {
        description: t('categoryAddedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error adding category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddCategory')
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (category: CategoryWithOrder) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          assignment: category.assignment,
          priority: category.priority,
          deadline: typeof category.deadline === 'object' ? category.deadline.toISOString() : category.deadline,
          status: category.status,
          order: category.order || category.priority
        })
        .eq('id', category.id);

      if (error) throw error;
      
      toast.success(t('categoryUpdated'), {
        description: t('categoryUpdatedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateCategory')
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success(t('categoryDeleted'), {
        description: t('categoryDeletedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteCategory')
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const archiveCategory = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(t('categoryArchived'), {
        description: t('categoryArchivedDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error archiving category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotArchiveCategory')
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const restoreCategory = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ archived: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(t('categoryRestored'), {
        description: t('categoryRestoredDesc')
      });
      
      return true;
    } catch (err: any) {
      console.error('Error restoring category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotRestoreCategory')
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    restoreCategory,
    isLoading: loading
  };
};

// Kategoriyanın sadə standart xüsusiyyətlərini göstərən funksiya
export function getDefaultCategoryValues(): Partial<CategoryWithOrder> {
  return {
    name: '',
    description: '',
    assignment: 'all',
    priority: 1,
    status: 'active',
    archived: false
  };
}
