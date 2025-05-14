
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryWithColumns } from '@/types/category';
import { Column, ColumnOption } from '@/types/column';

export function useCategoryData(schoolId?: string) {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async (): Promise<CategoryWithColumns[]> => {
    try {
      setLoading(true);
      
      // Fetch all categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: true });

      if (categoryError) throw categoryError;
      if (!categoryData) return [];

      // Get category IDs to fetch columns
      const categoryIds = categoryData.map(category => category.id);
      
      // Fetch columns for all categories
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoryIds)
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;
      
      // Group columns by category
      const columnsByCategory = columnsData?.reduce((acc, column) => {
        // Process the column to match the Column type
        const processedColumn = {
          ...column,
          options: Array.isArray(column.options) 
            ? column.options 
            : typeof column.options === 'string' 
              ? JSON.parse(column.options)
              : column.options || [],
          validation: typeof column.validation === 'string' 
            ? JSON.parse(column.validation) 
            : column.validation || {},
          type: column.type as Column['type'],
          color: column.color || undefined,
          description: column.description || ''
        } as unknown as Column;
        
        if (!acc[column.category_id]) {
          acc[column.category_id] = [];
        }
        acc[column.category_id].push(processedColumn);
        return acc;
      }, {} as Record<string, Column[]>) || {};

      // Combine categories with their columns
      const categoriesWithColumns = categoryData.map(category => {
        return {
          ...category,
          columns: columnsByCategory[category.id] || [],
          columnCount: columnsByCategory[category.id]?.length || 0,
          status: category.status as Category['status']
        } as CategoryWithColumns;
      });
      
      setCategories(categoriesWithColumns);
      return categoriesWithColumns;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch categories');
      setError(error);
      console.error('Error fetching categories:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ['categories', schoolId],
    queryFn: fetchCategories,
    enabled: true
  });

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  return {
    categories,
    loading,
    error,
    refetch
  };
}
