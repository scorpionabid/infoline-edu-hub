import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { adaptSupabaseCategory } from '@/api/categoryApi';
import { toast } from 'sonner';


const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const adaptedCategories = data.map(item => adaptSupabaseCategory(item));
        setCategories(adaptedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Kateqoriyaları əldə edərkən xəta:', error);
      toast.error('Kateqoriyaları yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCategoryById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return adaptSupabaseCategory(data);
    } catch (error) {
      console.error('Kateqoriya məlumatlarını əldə edərkən xəta:', error);
      return null;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Kateqoriya silindikdən sonra siyahını yeniləyirik
      setCategories(prevCategories => 
        prevCategories.filter(category => category.id !== id)
      );

      return true;
    } catch (error) {
      console.error('Kateqoriyanı silmək mümkün olmadı:', error);
      return false;
    }
  }, []);

  return {
    categories,
    isLoading,
    getCategories,
    getCategoryById,
    deleteCategory
  };
};

export default useCategories;
