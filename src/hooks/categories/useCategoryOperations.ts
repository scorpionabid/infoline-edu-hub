
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, AddCategoryFormData, CategoryStatus } from '@/types/category';

export const useCategoryOperations = () => {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      // Convert the deadline to string if it's a Date object
      const processedCategory = {
        ...category,
        deadline: category.deadline ? String(category.deadline) : null
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert([processedCategory])
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { data: data?.[0], error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    return createCategory(category);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      // Convert the deadline to string if it's a Date object
      const processedUpdates = {
        ...updates,
        deadline: updates.deadline ? String(updates.deadline) : null
      };
      
      const { data, error } = await supabase
        .from('categories')
        .update(processedUpdates)
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { data: data?.[0], error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err.message };
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, error: null };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const archiveCategory = async (id: string) => {
    return updateCategory(id, { status: 'archived', archived: true });
  };

  const updateCategoryStatus = async (id: string, status: CategoryStatus) => {
    return updateCategory(id, { status });
  };

  return {
    loading,
    isLoading,
    error,
    createCategory,
    addCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    archiveCategory,
  };
};

export default useCategoryOperations;
