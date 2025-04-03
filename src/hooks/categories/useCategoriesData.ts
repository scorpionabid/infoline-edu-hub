
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Bütün kateqoriyaları əldə etmə
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority');

      if (error) throw error;

      setCategories(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Kateqoriyaları əldə edərkən xəta:', error);
      setIsError(true);
      setIsLoading(false);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    }
  }, []);

  // Tək kateqoriya əldə etmə
  const fetchSingleCategory = useCallback(async (categoryId: string): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Kateqoriya yüklənərkən xəta:', error);
      toast.error('Kateqoriya yüklənərkən xəta baş verdi');
      return null;
    }
  }, []);

  // Kateqoriya yaratma
  const createCategory = useCallback(async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          id: uuid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Kateqoriya yaradılarkən xəta:', error);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Kateqoriya yeniləmə
  const updateCategory = useCallback(async (categoryData: Partial<Category> & { id: string }) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryData.id)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryData.id ? data : cat
      ));
      
      return data;
    } catch (error) {
      console.error('Kateqoriya yenilənərkən xəta:', error);
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Kateqoriya silmə
  const deleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success(`"${categoryName}" kateqoriyası silindi`);
      return true;
    } catch (error) {
      console.error('Kateqoriya silinərkən xəta:', error);
      toast.error('Kateqoriya silinərkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Kateqoriya arxivləmə
  const archiveCategory = useCallback(async (categoryId: string, archived: boolean) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ 
          archived, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => cat.id === categoryId ? data : cat)
      );
      
      return true;
    } catch (error) {
      console.error('Kateqoriyanın arxiv statusu dəyişdirilkən xəta:', error);
      toast.error('Kateqoriyanın arxiv statusu dəyişdirilkən xəta baş verdi');
      throw error;
    }
  }, []);

  // İlkin yükləmə
  const initialize = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Komponent yüklənərkən işə sal
  useState(() => {
    initialize();
  });

  return {
    categories,
    isLoading,
    isError,
    fetchCategories,
    fetchSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory
  };
};

export default useCategoriesData;
