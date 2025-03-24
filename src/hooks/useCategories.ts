
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
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority');

      if (error) throw error;
      
      // Adapter vasitəsi ilə məlumatları daha təhlükəsiz çeviririk
      setCategories(data.map(category => adaptSupabaseCategory(category)));
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

  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data as Category]);
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
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...data } as Category : category
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
