import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryFilter } from '@/types/category';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';

export const useCategories = () => {
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async (filterOptions: CategoryFilter = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Start building the query
      let query = supabase
        .from('categories')
        .select('*');

      // Apply filters based on user role and permissions
      if (userRole === 'sectoradmin' && sectorId) {
        // Filter categories based on sector assignment
        // This is a placeholder - implement according to your schema
        // For now, we'll just fetch all categories for sector admins
        // You may need to adjust this based on your actual data model
      }

      // Apply status filter if provided
      if (filterOptions.status && filterOptions.status.length > 0) {
        query = query.in('status', filterOptions.status);
      }

      // Apply search filter if provided
      if (filterOptions.search) {
        query = query.ilike('name', `%${filterOptions.search}%`);
      }

      // Apply pagination if provided
      if (filterOptions.page !== undefined && filterOptions.limit !== undefined) {
        const from = filterOptions.page * filterOptions.limit;
        const to = from + filterOptions.limit - 1;
        query = query.range(from, to);
      }

      // Execute the query
      const { data, error } = await query;

      if (error) throw error;

      setCategories(data as Category[]);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
      toast.error('Failed to load categories', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [userRole, regionId, sectorId, schoolId]);

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data as Category]);
      return data as Category;
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err);
      toast.error('Failed to create category', {
        description: err.message
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<Category>) => {
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

      setCategories(prev => prev.map(category => 
        category.id === id ? { ...category, ...data } : category
      ));
      return data as Category;
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err);
      toast.error('Failed to update category', {
        description: err.message
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(category => category.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err);
      toast.error('Failed to delete category', {
        description: err.message
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data as Category;
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(err);
      toast.error('Failed to load category', {
        description: err.message
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  };
};
