import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

interface CategoryData {
  id: string;
  name: string;
  columns: any[];
}

interface UseCategoryDataProps {
  categoryId?: string;
}

export const useCategoryData = ({ categoryId }: UseCategoryDataProps) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name')
          .eq('id', categoryId)
          .single();

        if (categoryError) {
          throw new Error(`Error fetching category: ${categoryError.message}`);
        }

        if (!categoryData) {
          throw new Error('Category not found');
        }

        // Fetch columns for the category
        const { data: columnsData, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('category_id', categoryId)
          .order('order_index', { ascending: true });

        if (columnsError) {
          throw new Error(`Error fetching columns: ${columnsError.message}`);
        }

        // Transform column data
        const transformedColumns = columnsData.map(transformColumnData);

        setCategory({
          id: categoryData.id,
          name: categoryData.name,
          columns: transformedColumns,
        });
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, user]);

  // Add support for 'section', 'color', and 'description' fields when fetching column data
  const transformColumnData = (column: any) => {
    let optionsArray = [];
    let validationObj = {};

    // Process options
    if (column.options) {
      try {
        optionsArray = typeof column.options === 'string' ? JSON.parse(column.options) : column.options;
        if (!Array.isArray(optionsArray)) {
          optionsArray = []; // Ensure it's always an array
        }
      } catch (e) {
        console.error('Failed to parse options:', e);
        optionsArray = [];
      }
    }

    // Process validation
    if (column.validation) {
      try {
        validationObj = typeof column.validation === 'string' ? JSON.parse(column.validation) : column.validation;
      } catch (e) {
        console.error('Failed to parse validation:', e);
        validationObj = {};
      }
    }

    return {
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type,
      is_required: column.is_required,
      placeholder: column.placeholder || '',
      help_text: column.help_text || '',
      order_index: column.order_index,
      validation: validationObj,
      options: optionsArray,
      default_value: column.default_value || '',
      status: column.status || 'active',
      created_at: column.created_at,
      updated_at: column.updated_at,
    };
  };

  return {
    category,
    isLoading,
    error,
  };
};
