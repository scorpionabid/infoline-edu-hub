
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types/category';

export const useCategoryOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
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
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
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
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
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
    }
  };

  const archiveCategory = async (id: string) => {
    return updateCategory(id, { status: 'archived', archived: true });
  };

  return {
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
  };
};

export default useCategoryOperations;
