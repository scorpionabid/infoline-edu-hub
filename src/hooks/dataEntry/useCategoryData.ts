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
  schoolId?: string; // School ID parameter
}

export const useCategoryData = ({ categoryId, schoolId }: UseCategoryDataProps = {}) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false); // alias for backward compatibility
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // UUID validation helper
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Fetch all categories for a school
  const fetchSchoolCategories = async (schoolId: string) => {
    if (!schoolId) {
      console.log('No schoolId provided to fetchSchoolCategories');
      setCategories([]);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    if (!isValidUUID(schoolId)) {
      console.error('Invalid schoolId format:', schoolId);
      setError('Invalid school ID format');
      setCategories([]);
      setIsLoading(false);
      setLoading(false);
      return;
    }

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
      
      // Safety check for valid category data with UUID validation
      const validCategoryIds = categoriesData
        .filter(cat => cat && cat.id && isValidUUID(cat.id))
        .map(cat => cat.id);
        
      if (validCategoryIds.length === 0) {
        setCategories([]);
        setIsLoading(false);
        setLoading(false);
        return;
      }
      
      // Fetch columns for all categories
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', validCategoryIds)
        .order('order_index');
      
      if (columnsError) {
        throw new Error(`Error fetching columns data: ${columnsError.message}`);
      }
      
      // Process categories with their columns
      const categoriesWithColumns: CategoryData[] = categoriesData
        .filter(category => category && category.id && isValidUUID(category.id)) // Filter out invalid categories
        .map(category => {
          const categoryColumns = columnsData
            ? columnsData.filter(col => col && col.category_id === category.id && isValidUUID(col.id || ''))
            : [];
          
          // Process column data
          const processedColumns: Column[] = categoryColumns
            .filter(column => column && column.id) // Filter out invalid columns
            .map((column: any) => {
              // Parse options and validation if needed
              const options = parseJsonSafe(
                typeof column.options === 'string' ? column.options : JSON.stringify(column.options || []), 
                []
              );

              const validation = parseJsonSafe(
                typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation || {}), 
                {}
              );

              // Return the processed column with correct type
              return {
                id: column.id,
                category_id: column.category_id,
                name: column.name || '',
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
            name: category.name || '',
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
      setCategory(null);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    if (!isValidUUID(categoryId)) {
      console.error('Invalid categoryId format:', categoryId);
      setError('Invalid category ID format');
      setCategory(null);
      setIsLoading(false);
      setLoading(false);
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

      if (!categoryData || !categoryData.id) {
        setCategory(null);
        throw new Error(`Category not found with ID: ${categoryId}`);
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

      // Process column data safely
      const processedColumns: Column[] = Array.isArray(columnsData) ? columnsData
        .filter(column => column && column.id) // Filter out invalid columns
        .map((column: any) => {
          // Parse options and validation if needed
          const options = parseJsonSafe(
            typeof column.options === 'string' ? column.options : JSON.stringify(column.options || []), 
            []
          );

          const validation = parseJsonSafe(
            typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation || {}), 
            {}
          );

          // Return the processed column with correct type
          return {
            id: column.id,
            category_id: column.category_id,
            name: column.name || '',
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
        }) : [];

      // Create the category object with columns
      const category: CategoryData = {
        id: categoryData.id,
        name: categoryData.name || '',
        description: categoryData.description || '',
        columns: processedColumns,
      };

      setCategory(category);
    } catch (err: any) {
      console.error('Error in useCategoryData:', err);
      setError(err.message || 'Failed to fetch category data');
      toast.error('Failed to fetch category data');
      setCategory(null);
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

export default useCategoryData;
