
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryAssignment, adaptSupabaseCategory } from '@/types/category';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      
      const formattedCategories: Category[] = data.map(category => adaptSupabaseCategory(category));
      
      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          assignment: categoryData.assignment,
          status: categoryData.status || 'active',
          deadline: categoryData.deadline,
          archived: categoryData.archived || false,
          priority: categoryData.priority || 0,
          column_count: categoryData.column_count || 0
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newCategory = adaptSupabaseCategory(data);
      
      setCategories(prev => [...prev, newCategory]);
      
      return newCategory;
    } catch (err: any) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (categoryData: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          description: categoryData.description,
          assignment: categoryData.assignment,
          status: categoryData.status,
          deadline: categoryData.deadline,
          archived: categoryData.archived,
          priority: categoryData.priority,
          column_count: categoryData.column_count,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryData.id);
      
      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryData.id ? { ...categoryData } : cat
        )
      );
      
      return categoryData;
    } catch (err: any) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, []);

  const archiveCategory = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', categoryId);
      
      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId ? { ...cat, archived: true } : cat
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error archiving category:', err);
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      // İlk öncə əlaqəli column-ları silib sonra kateqoriyanı silməliyik
      const { error: columnsError } = await supabase
        .from('columns')
        .delete()
        .eq('category_id', categoryId);
      
      if (columnsError) throw columnsError;
      
      const { error: categoryError } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (categoryError) throw categoryError;
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      throw err;
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory
  };
};
