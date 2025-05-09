
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';

export const useCategoryActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (categoryData: Partial<Category>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Kateqoriya uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Kateqoriya yaratmaq mümkün olmadı');
      toast.error(err.message || 'Kateqoriya yaratmaq mümkün olmadı');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Kateqoriya uğurla yeniləndi');
      return data;
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Kateqoriya yeniləmək mümkün olmadı');
      toast.error(err.message || 'Kateqoriya yeniləmək mümkün olmadı');
      return null;
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

      if (error) throw error;

      toast.success('Kateqoriya uğurla silindi');
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Kateqoriya silmək mümkün olmadı');
      toast.error(err.message || 'Kateqoriya silmək mümkün olmadı');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
    error
  };
};
