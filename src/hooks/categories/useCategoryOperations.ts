
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, AddCategoryFormData, formatDeadlineForApi } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Hook for category CRUD operations
 */
export const useCategoryOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const addCategory = async (categoryData: AddCategoryFormData): Promise<Category | null> => {
    setIsLoading(true);
    try {
      // Ensure name is required
      if (!categoryData.name) {
        toast.error(t('nameRequired'));
        return null;
      }
      
      // Format deadline for API
      const deadline = formatDeadlineForApi(categoryData.deadline);
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || '',
          status: categoryData.status || 'active',
          assignment: categoryData.assignment || 'all',
          priority: categoryData.priority || 0,
          deadline: deadline,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(t('categoryAdded'));
      return data as Category;
    } catch (error: any) {
      console.error('Failed to add category:', error);
      toast.error(t('categoryAddError'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category | null> => {
    setIsLoading(true);
    try {
      // Format deadline for API if present
      const deadline = categoryData.deadline ? formatDeadlineForApi(categoryData.deadline) : undefined;
      
      const { data, error } = await supabase
        .from('categories')
        .update({ 
          ...categoryData, 
          deadline: deadline
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(t('categoryUpdated'));
      return data as Category;
    } catch (error: any) {
      console.error('Failed to update category:', error);
      toast.error(t('categoryUpdateError'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteCategory = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(t('categoryDeleted'));
      return true;
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(t('categoryDeleteError'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Kateqoriyaları gətirən funksiya
   * @param searchQuery - Axtarış sorgusu
   * @param filters - Filter parametrləri
   * @returns Kateqoriyaların siyahısı
   */
  const fetchCategories = async (searchQuery: string = '', filters: any = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('categories')
        .select('*');
      
      // Axtarış sorgusu varsa filter tətbiq edirik
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      
      // Status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // Assignment filter
      if (filters.assignment) {
        query = query.eq('assignment', filters.assignment);
      }
      
      // Sorgu
      const { data, error: apiError } = await query;
      
      if (apiError) {
        throw apiError;
      }
      
      return data as Category[];
    } catch (err: any) {
      console.error('Kateqoriyaları yükləyərkən xəta baş verdi:', err);
      setError(err.message || t('categoryFetchError'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};

export default useCategoryOperations;
