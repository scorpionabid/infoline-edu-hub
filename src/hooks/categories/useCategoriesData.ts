
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { toast } from 'sonner';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      
      const formattedCategories = data.map(category => ({
        ...category,
        id: category.id,
        name: category.name,
        description: category.description || '',
        assignment: category.assignment || 'all',
        deadline: category.deadline || '',
        status: category.status || 'active',
        archived: category.archived || false,
        priority: category.priority || 0,
        order: category.order || category.priority || 0,
        columnCount: category.column_count || 0,
        createdAt: category.created_at,
        updatedAt: category.updated_at
      })) as Category[];

      setCategories(formattedCategories);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Kateqoriyaları yükləyərkən xəta:', err);
      setError(err);
      setIsLoading(false);
      toast.error('Kateqoriyaları yükləyərkən xəta baş verdi');
    }
  }, []);

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = {
        name: categoryData.name,
        description: categoryData.description || '',
        assignment: categoryData.assignment || 'all',
        status: categoryData.status || 'active',
        deadline: categoryData.deadline || null,
        archived: categoryData.archived || false,
        priority: categoryData.priority || 0,
        order: categoryData.order || categoryData.priority || 0,
        column_count: categoryData.columnCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;

      const createdCategory: Category = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        assignment: data.assignment || 'all',
        deadline: data.deadline || undefined,
        status: data.status || 'active',
        archived: data.archived || false,
        priority: data.priority || 0,
        order: data.order || data.priority || 0,
        columnCount: data.column_count || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setCategories(prev => [...prev, createdCategory]);
      toast.success('Kateqoriya uğurla yaradıldı');
      return data;
    } catch (err: any) {
      console.error('Kateqoriya yaradılarkən xəta:', err);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (categoryData: Category) => {
    try {
      const updatedCategory = {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        assignment: categoryData.assignment || 'all',
        status: categoryData.status || 'active',
        deadline: categoryData.deadline || null,
        archived: categoryData.archived || false,
        priority: categoryData.priority || 0,
        order: categoryData.order || categoryData.priority || 0,
        column_count: categoryData.columnCount || 0,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('categories')
        .update(updatedCategory)
        .eq('id', categoryData.id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === categoryData.id ? categoryData : cat)
      );
      
      toast.success('Kateqoriya uğurla yeniləndi');
      return updatedCategory;
    } catch (err: any) {
      console.error('Kateqoriya yenilənərkən xəta:', err);
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const archiveCategory = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          archived: true,
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, archived: true, status: 'inactive' } 
            : cat
        )
      );
      
      toast.success('Kateqoriya arxivə köçürüldü');
      return true;
    } catch (err: any) {
      console.error('Kateqoriya arxivləşdirilərkən xəta:', err);
      toast.error('Kateqoriya arxivləşdirilərkən xəta baş verdi');
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      // Kateqoriyaya aid sütunları silirik
      const { error: columnsError } = await supabase
        .from('columns')
        .delete()
        .eq('category_id', categoryId);

      if (columnsError) throw columnsError;
      
      // Sonra kateqoriyanı silirik
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== categoryId));
      toast.success('Kateqoriya uğurla silindi');
      
      return true;
    } catch (err: any) {
      console.error('Kateqoriya silinərkən xəta:', err);
      toast.error('Kateqoriya silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Komponentin ilkin yüklənməsi zamanı
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
