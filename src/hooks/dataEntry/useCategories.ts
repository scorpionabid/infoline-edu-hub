
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';

export const useCategories = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async (): Promise<CategoryWithColumns[]> => {
    try {
      setLoading(true);
      
      // Fetch all categories
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('priority');

      if (categoryError) {
        throw new Error(categoryError.message);
      }
      
      if (!categories || categories.length === 0) {
        return [];
      }

      // Fetch columns for each category
      const categoryIds = categories.map(cat => cat.id);
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoryIds);
      
      if (columnsError) {
        throw new Error(columnsError.message);
      }
      
      // Map columns to their respective categories
      const columnsByCategory: Record<string, Column[]> = {};
      columns?.forEach((col: any) => {
        if (!columnsByCategory[col.category_id]) {
          columnsByCategory[col.category_id] = [];
        }
        
        // Process column to match Column type
        const processedColumn: Column = {
          ...col,
          type: col.type as Column['type'],
          options: typeof col.options === 'string' ? JSON.parse(col.options) : col.options,
          validation: typeof col.validation === 'string' ? JSON.parse(col.validation) : col.validation,
          description: col.description || '',
          color: col.color || undefined
        };
        
        columnsByCategory[col.category_id].push(processedColumn);
      });
      
      // Create CategoryWithColumns objects
      const categoriesWithColumns: CategoryWithColumns[] = categories.map(category => {
        const categoryWithProcessedStatus = {
          ...category,
          status: category.status as Category['status']
        };
        
        return {
          ...categoryWithProcessedStatus,
          columns: columnsByCategory[category.id] || [],
          columnCount: columnsByCategory[category.id]?.length || 0
        };
      });
      
      return categoriesWithColumns;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch categories');
      setError(error);
      console.error('Error in useCategories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['all-categories'],
    queryFn: fetchCategories
  });
  
  return { 
    categories: data || [], 
    loading: isLoading || loading,
    error,
    refetch
  };
};
