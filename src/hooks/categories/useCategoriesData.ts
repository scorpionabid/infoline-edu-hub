
// Burda əlavə yenilək və order məlumatını əlavə edək
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryAssignment, adaptSupabaseCategory } from '@/types/category';
import { toast } from 'sonner';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;

      const formattedCategories = data.map(category => {
        // Make sure order is set properly
        const order = category.order || category.priority || 1;
        
        return {
          ...adaptSupabaseCategory(category),
          order
        };
      });
      
      setCategories(formattedCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new category
  const createCategory = useCallback(async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Ensure the assignment is valid
      const validAssignment: CategoryAssignment = (categoryData.assignment === 'all' || categoryData.assignment === 'sectors') 
        ? categoryData.assignment 
        : 'all';
      
      // Convert Date to ISO string if needed
      let deadline = categoryData.deadline;
      if (deadline instanceof Date) {
        deadline = deadline.toISOString();
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          description: categoryData.description || '',
          assignment: validAssignment,
          status: categoryData.status || 'active',
          deadline: deadline,
          archived: categoryData.archived || false,
          priority: categoryData.priority || 1,
          order: categoryData.order || categoryData.priority || 1,
          column_count: categoryData.columnCount || 0
        }])
        .select()
        .single();
      
      if (error) throw error;

      const newCategory = adaptSupabaseCategory(data);
      newCategory.order = data.order || data.priority || 1;
      
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, []);

  // Update an existing category
  const updateCategory = useCallback(async (categoryData: Category) => {
    try {
      // Convert Date to ISO string if needed
      let deadline = categoryData.deadline;
      if (deadline instanceof Date) {
        deadline = deadline.toISOString();
      }
      
      const { error } = await supabase
        .from('categories')
        .update({
          id: categoryData.id,
          name: categoryData.name,
          description: categoryData.description,
          assignment: categoryData.assignment,
          status: categoryData.status,
          deadline: deadline,
          archived: categoryData.archived,
          priority: categoryData.priority,
          order: categoryData.order,
          column_count: categoryData.columnCount,
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

  // Archive a category instead of deleting
  const archiveCategory = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ archived: true, status: 'inactive' })
        .eq('id', categoryId);
      
      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, archived: true, status: 'inactive' } 
            : cat
        )
      );
      
      return true;
    } catch (err: any) {
      console.error('Error archiving category:', err);
      throw err;
    }
  }, []);

  // Permanently delete a category
  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
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
