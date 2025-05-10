import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category, CategoryFilter, CategoryStatus, CategoryAssignment } from '@/types/category';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add pagination state
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Fetch categories with filters
  const fetchCategories = useCallback(async (filter: CategoryFilter = {}) => {
    console.log('Fetching categories with filter:', filter);
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('categories').select('*', { count: 'exact' });
      
      // Apply filters
      if (filter.status) {
        // Handle status as string or string[]
        if (Array.isArray(filter.status)) {
          if (filter.status.length > 0) {
            query = query.in('status', filter.status);
          }
        } else if (filter.status) {
          query = query.eq('status', filter.status);
        }
      }
      
      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }
      
      // Only add archived filter if it exists in the filter object
      if (filter.archived !== undefined) {
        query = query.eq('archived', filter.archived);
      } else {
        // Default to non-archived categories
        query = query.eq('archived', false);
      }

      // Add pagination
      const pageNumber = filter.page || currentPage;
      const limit = filter.limit || pageSize;
      const startIndex = (pageNumber - 1) * limit;
      
      query = query.range(startIndex, startIndex + limit - 1);
      
      console.log('Supabase query:', query);
      
      const { data, count, error } = await query;
      
      console.log('Query result:', { data, count, error });
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      if (count !== null) {
        setTotalCount(count);
      }
      
      if (data) {
        // Transform data to match Category type
        const transformedData: Category[] = data.map(item => {
          console.log('Raw category item:', item);
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            deadline: item.deadline || '',
            status: (item.status || 'active') as CategoryStatus,
            priority: item.priority || 0,
            assignment: (item.assignment || 'all') as CategoryAssignment,
            column_count: item.column_count || 0,
            archived: item.archived || false,
            created_at: item.created_at,
            updated_at: item.updated_at,
            completionRate: 0
          };
        });
        
        console.log('Transformed categories:', transformedData);
        
        setCategories(transformedData);
      } else {
        console.warn('No category data returned');
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Full error in fetchCategories:', error);
      setError(error.message);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);
  
  // Create a new category
  const createCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      // Prepare data for insertion
      const insertData = {
        name: categoryData.name,
        description: categoryData.description,
        deadline: categoryData.deadline,
        status: categoryData.status,
        priority: categoryData.priority,
        assignment: categoryData.assignment,
        archived: categoryData.archived
      };
      
      const { data, error } = await supabase
        .from('categories')
        .insert([insertData])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data[0]) {
        // Add the new category to state
        const newCategory: Category = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description || '',
          deadline: data[0].deadline || '',
          status: (data[0].status || 'active') as CategoryStatus,
          priority: data[0].priority || 0,
          assignment: data[0].assignment || 'all',
          column_count: data[0].column_count || 0,
          archived: data[0].archived || false,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          completionRate: 0
        };
        
        setCategories(prev => [...prev, newCategory]);
        toast.success('Kateqoriya uğurla yaradıldı');
        return newCategory;
      }
      return null;
    } catch (error: any) {
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      console.error('Error creating category:', error);
      return null;
    }
  };
  
  // Update a category
  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      // Prepare data for update, removing any properties not in the database schema
      const updateData = {
        name: categoryData.name,
        description: categoryData.description,
        deadline: categoryData.deadline instanceof Date 
          ? categoryData.deadline.toISOString() 
          : categoryData.deadline,
        status: categoryData.status,
        priority: categoryData.priority,
        assignment: categoryData.assignment,
        archived: categoryData.archived
      };
      
      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the category in state
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...categoryData } : cat
      ));
      
      toast.success('Kateqoriya uğurla yeniləndi');
      return true;
    } catch (error: any) {
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
      console.error('Error updating category:', error);
      return false;
    }
  };
  
  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Remove the category from state
      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      toast.success('Kateqoriya uğurla silindi');
      return true;
    } catch (error: any) {
      toast.error('Kateqoriya silinərkən xəta baş verdi');
      console.error('Error deleting category:', error);
      return false;
    }
  };
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories({ archived: false });
  }, [fetchCategories]);
  
  return {
    categories,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
