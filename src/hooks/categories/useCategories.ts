
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, CategoryFilter } from '@/types/category';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>({
    search: '',
    status: '',
    assignment: ''
  });

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('categories')
        .select('*');

      // Apply filters if they exist
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.assignment) {
        query = query.eq('assignment', filter.assignment);
      }

      if (filter.search) {
        query = query.ilike('name', `%${filter.search}%`);
      }

      // Add sorting if specified
      if (filter.sortBy) {
        const order = filter.sortOrder || 'asc';
        query = query.order(filter.sortBy, { ascending: order === 'asc' });
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update filter and refetch
  const updateFilter = (newFilter: Partial<CategoryFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter
    }));
  };

  // Effect to fetch categories when the filter changes
  useEffect(() => {
    fetchCategories();
  }, [filter]);

  // Create, update and delete functions
  const createCategory = async (category: Omit<Category, 'id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();

      if (error) throw error;
      
      setCategories(prev => [...prev, data[0]]);
      return { data: data[0], error: null };
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating category:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
      );
      return { data: data[0], error: null };
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating category:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting category:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Filtered categories memo
  const filteredCategories = useMemo(() => {
    return categories;
  }, [categories]);

  return {
    categories: filteredCategories,
    loading,
    error,
    filter,
    updateFilter,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};

export default useCategories;
