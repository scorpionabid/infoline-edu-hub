
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
  schoolId?: string; // Added schoolId as optional parameter
}

export const useCategoryData = ({ categoryId, schoolId }: UseCategoryDataProps) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false); // alias for backward compatibility
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all categories for a school
  const fetchSchoolCategories = async (schoolId: string) => {
    setIsLoading(true);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch categories that are applicable to schools
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('status', 'active')
        .in('assignment', ['schools', 'all']);
      
      if (categoriesError) {
        throw new Error(`Error fetching school categories: ${categoriesError.message}`);
      }
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setIsLoading(false);
        setLoading(false);
        return;
      }
      
      // Fetch columns for all categories
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', categoriesData.map(cat => cat.id))
        .order('order_index');
      
      if (columnsError) {
        throw new Error(`Error fetching columns data: ${columnsError.message}`);
      }
      
      // Process categories with their columns
      const categoriesWithColumns: CategoryData[] = categoriesData.map(category => {
        const categoryColumns = columnsData
          ? columnsData.filter(col => col.category_id === category.id)
          : [];
        
        // Process column data
        const processedColumns: Column[] = categoryColumns.map((column: any) => {
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
            id: column.id,
            category_id: column.category_id,
            name: column.name,
            type: column.type as ColumnType,
            is_required: Boolean(column.is_required),
            placeholder: column.placeholder || '',
            help_text: column.help_text || '',
            default_value: column.default_value || '',
            order_index: column.order_index || 0,
            status: column.status || 'active',
            options,
            validation,
            description: column.description || '',
            section: column.section || '',
            color: column.color || '',
            created_at: column.created_at,
            updated_at: column.updated_at
          } as Column;
        });
        
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          columns: processedColumns,
        };
      });
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error in fetchSchoolCategories:', err);
      setError(err.message || 'Failed to fetch categories data');
      toast.error('Failed to fetch categories data');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

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
      const processedColumns: Column[] = columnsData.map((column: any) => {
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
          id: column.id,
          category_id: column.category_id,
          name: column.name,
          type: column.type as ColumnType,
          is_required: Boolean(column.is_required),
          placeholder: column.placeholder || '',
          help_text: column.help_text || '',
          default_value: column.default_value || '',
          order_index: column.order_index || 0,
          status: column.status || 'active',
          options,
          validation,
          description: column.description || '',
          section: column.section || '',
          color: column.color || '',
          created_at: column.created_at,
          updated_at: column.updated_at
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

  // Fetch data based on provided parameters
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    } else if (schoolId) {
      fetchSchoolCategories(schoolId);
    }
  }, [categoryId, schoolId]);

  // Add a refetch function
  const refetch = () => {
    if (categoryId) {
      fetchCategoryData();
    } else if (schoolId) {
      fetchSchoolCategories(schoolId);
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
