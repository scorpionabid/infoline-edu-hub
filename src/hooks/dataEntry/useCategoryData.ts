
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { Column } from '@/types/column';

interface CategoryData {
  id: string;
  name: string;
  columns: Column[];
  description?: string; // Add description property
}

export interface UseCategoryDataProps {
  categoryId?: string;
}

export const useCategoryData = ({ categoryId }: UseCategoryDataProps) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false); // alias for backward compatibility
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCategoryData = async () => {
    if (!categoryId) {
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        throw new Error(`Error fetching category data: ${categoryError.message}`);
      }

      // Fetch columns for this category
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (columnsError) {
        throw new Error(`Error fetching column data: ${columnsError.message}`);
      }

      // Process column data
      const processedColumns = columnsData.map(column => {
        // Parse options and validation if needed
        let options = [];
        if (column.options) {
          try {
            options = typeof column.options === 'string' 
              ? JSON.parse(column.options) 
              : column.options;
          } catch (e) {
            console.error('Failed to parse column options:', e);
            options = [];
          }
        }

        let validation = {};
        if (column.validation) {
          try {
            validation = typeof column.validation === 'string'
              ? JSON.parse(column.validation)
              : column.validation;
          } catch (e) {
            console.error('Failed to parse column validation:', e);
            validation = {};
          }
        }

        // Return the processed column
        return {
          ...column,
          options,
          validation,
        };
      });

      // Create the category object with columns
      const category: CategoryData = {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        columns: processedColumns,
      };

      setCategory(category);
    } catch (err) {
      console.error('Error in useCategoryData:', err);
      setError(err.message || 'Failed to fetch category data');
      toast.error('Failed to fetch category data');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Fetch data on mount or categoryId change
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  // Add a refetch function
  const refetch = () => {
    if (categoryId) {
      fetchCategoryData();
    }
  };

  return {
    category,
    categories,
    isLoading,
    loading,
    error,
    refetch
  };
};
