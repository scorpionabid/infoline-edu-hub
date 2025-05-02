
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategoryActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Yeni kateqoriya əlavə etmə
  const createCategory = async (category: Omit<Category, "id">) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Əlavə ediləcək məlumatları hazırlayaq
      const newCategory = {
        name: category.name,
        description: category.description || '',
        assignment: category.assignment,
        status: category.status,
        priority: category.priority || 0,
        deadline: category.deadline ? new Date(category.deadline).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived: false
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('categoryCreated'));
      return data;
    } catch (err: any) {
      console.error('Kateqoriya əlavə edilərkən xəta:', err);
      setError(err.message);
      toast.error(t('categoryCreateError'), { 
        description: err.message 
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Kateqoriya yeniləmə
  const updateCategory = async (category: Omit<Category, "id"> & { id: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Yenilənəcək məlumatları hazırlayaq
      const updatedCategory = {
        name: category.name,
        description: category.description,
        assignment: category.assignment,
        status: category.status,
        priority: category.priority || 0,
        deadline: category.deadline ? new Date(category.deadline).toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('categories')
        .update(updatedCategory)
        .eq('id', category.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(t('categoryUpdated'));
      return data;
    } catch (err: any) {
      console.error('Kateqoriya yenilənərkən xəta:', err);
      setError(err.message);
      toast.error(t('categoryUpdateError'), { 
        description: err.message 
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Kateqoriya silmə
  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Kateqoriyanı arxivləşdir (yumşaq silmə)
      const { error } = await supabase
        .from('categories')
        .update({ archived: true, status: 'inactive', updated_at: new Date().toISOString() })
        .eq('id', categoryId);
        
      if (error) throw error;
      
      toast.success(t('categoryDeleted'));
      return { success: true };
    } catch (err: any) {
      console.error('Kateqoriya silinərkən xəta:', err);
      setError(err.message);
      toast.error(t('categoryDeleteError'), { 
        description: err.message 
      });
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    error
  };
};

export default useCategoryActions;
