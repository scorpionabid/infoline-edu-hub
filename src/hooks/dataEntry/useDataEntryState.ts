
import { useState, useCallback, useRef } from 'react';
import { CategoryWithColumns, Column, ColumnType } from '@/types/column';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CategoryStatus } from '@/types/category';

interface UseDataEntryStateProps {
  initialCategoryId?: string;
}

interface UseDataEntryStateReturn {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  currentIndex: number;
  setCategoryIndex: (index: number) => void;
  categoryIdRef: React.RefObject<string | null>;
  fetchCategoryData: () => Promise<void>;
}

export const useDataEntryState = ({
  initialCategoryId
}: UseDataEntryStateProps = {}): UseDataEntryStateReturn => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCategoryIndex] = useState(0);
  const categoryIdRef = useRef<string | null>(initialCategoryId || null);

  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Kateqoriyaları yükləyək
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (categoriesError) throw categoriesError;

      // Sütunları yükləyək
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('status', 'active')
        .order('order_index', { ascending: true });

      if (columnsError) throw columnsError;

      // Kateqoriya və sütunları birləşdirək
      const dataWithColumns: CategoryWithColumns[] = categoriesData.map(category => {
        const categoryColumns = columnsData.filter(column => column.category_id === category.id);
        
        return {
          id: category.id,
          name: category.name,
          description: category.description || '',
          assignment: category.assignment as 'sectors' | 'all',
          deadline: category.deadline,
          status: category.status as CategoryStatus,
          priority: category.priority || 0,
          created_at: category.created_at,
          updated_at: category.updated_at,
          columns: categoryColumns.map(col => ({
            id: col.id,
            category_id: col.category_id,
            name: col.name,
            type: col.type as ColumnType,
            is_required: col.is_required || true,
            order_index: col.order_index || 0,
            status: col.status as "active" | "inactive" | "draft",
            validation: col.validation,
            default_value: col.default_value,
            placeholder: col.placeholder,
            help_text: col.help_text,
            options: col.options,
            created_at: col.created_at,
            updated_at: col.updated_at
          }))
        };
      });

      setCategories(dataWithColumns);

      // Əgər initialCategoryId varsa, onunla başlayaq
      if (initialCategoryId) {
        const foundIndex = dataWithColumns.findIndex(cat => cat.id === initialCategoryId);
        if (foundIndex !== -1) {
          setCategoryIndex(foundIndex);
        }
      }
    } catch (err) {
      console.error('Error fetching category data:', err);
      toast.error('Kateqoriya məlumatlarını yükləmək mümkün olmadı');
    } finally {
      setIsLoading(false);
    }
  }, [initialCategoryId]);

  return {
    categories,
    isLoading,
    currentIndex,
    setCategoryIndex,
    categoryIdRef,
    fetchCategoryData
  };
};
