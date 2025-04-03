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

      // Add required 'order' property
      const formattedData = data.map(item => ({
        ...item,
        order: item.order || item.priority || 0
      }));
      
      setCategories(formattedData as Category[]);
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
      
      // Add required 'order' property
      const formattedData = {
        ...data,
        order: data.order || data.priority || 0
      };
      
      return formattedData as Category;
    } catch (error) {
      console.error('Kateqoriya yüklənərkən xəta:', error);
      toast.error('Kateqoriya yüklənərkən xəta baş verdi');
      return null;
    }
  }, []);

  // Kateqoriya yaratma
  const createCategory = useCallback(async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Ensure deadline is string
      const deadline = categoryData.deadline ? 
        (typeof categoryData.deadline === 'object' ? categoryData.deadline.toISOString() : categoryData.deadline) : 
        null;
        
      const supabaseCategory = {
        name: categoryData.name,
        description: categoryData.description,
        assignment: categoryData.assignment,
        priority: categoryData.priority,
        deadline: deadline,
        status: categoryData.status || 'active',
        order: categoryData.order || categoryData.priority,
        archived: categoryData.archived || false
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([supabaseCategory])
        .select()
        .single();

      if (error) throw error;
      
      const newCategory = {
        ...data,
        order: data.order || data.priority || 0
      } as Category;
      
      setCategories(prev => [...prev, newCategory]);
      
      return data;
    } catch (err: any) {
      console.error('Error adding category:', err);
      throw err;
    }
  }, []);

  // Kateqoriya yeniləmə
  const updateCategory = useCallback(async (updates: Partial<Category> & { id: string }) => {
    try {
      // Ensure deadline is string
      const deadline = updates.deadline ? 
        (typeof updates.deadline === 'object' ? updates.deadline.toISOString() : updates.deadline) : 
        null;
        
      const supabaseUpdates = {
        name: updates.name,
        description: updates.description,
        assignment: updates.assignment,
        priority: updates.priority,
        deadline: deadline,
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
      
      const updatedCategory = {
        ...data,
        order: data.order || data.priority || 0
      } as Category;
      
      setCategories(prev => prev.map(category => 
        category.id === updates.id ? updatedCategory : category
      ));
      
      return data;
    } catch (err: any) {
      console.error('Error updating category:', err);
      throw err;
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
