
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Category, adaptSupabaseCategory } from '@/types/category';

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
        deadline: category.deadline,
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

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      // Convert the frontend model updates to Supabase format
      const supabaseUpdates = {
        name: updates.name,
        description: updates.description,
        assignment: updates.assignment,
        priority: updates.priority,
        deadline: updates.deadline,
        status: updates.status,
        order: updates.order || updates.priority,
        archived: updates.archived
      };

      const { data, error } = await supabase
        .from('categories')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedCategory = adaptSupabaseCategory(data);
      setCategories(prev => prev.map(category => 
        category.id === id ? updatedCategory : category
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
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteCategory')
      });
      throw err;
    }
  };

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
    deleteCategory
  };
};
