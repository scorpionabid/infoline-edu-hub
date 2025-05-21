
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { Column, ColumnType } from '@/types/column';
import { parseJsonSafe } from '@/utils/json-utils';

interface CategoryData {
  id: string;
  name: string;
  columns: Column[];
  description?: string;
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
      const processedColumns: Column[] = columnsData.map(column => {
        // Parse options and validation if needed
        const options = parseJsonSafe(
          typeof column.options === 'string' ? column.options : JSON.stringify(column.options), 
          []
        );

        const validation = parseJsonSafe(
          typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation), 
          {}
        );

        // Return the processed column with correct type
        return {
          ...column,
          type: column.type as ColumnType,
          options,
          validation,
          description: column.description || '',
          section: column.section || '',
          color: column.color || '',
        } as Column;
      });

      // Create the category object with columns
      const category: CategoryData = {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description || '',
        columns: processedColumns,
      };

      setCategory(category);
    } catch (err: any) {
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
