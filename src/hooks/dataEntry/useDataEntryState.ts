import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CategoryWithColumns } from '@/types/column';

interface UseDataEntryStateProps {
  formId: string;
  schoolId: string;
}

interface UseDataEntryStateReturn {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const mockCategoriesData = [
  {
    id: uuidv4(),
    name: "Şagird Məlumatları",
    description: "Şagirdlərlə bağlı əsas məlumatlar",
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 gün sonra
    status: "active",
    priority: 1,
    assignment: "all",
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: uuidv4(),
        categoryId: "cat1",
        name: "Şagird sayı",
        type: "number",
        isRequired: true,
        order: 1,
        status: "active",
        validation: null
      },
      {
        id: uuidv4(),
        categoryId: "cat1",
        name: "Sinif sayı",
        type: "number",
        isRequired: false,
        order: 2,
        status: "active",
        validation: null
      }
    ]
  },
  {
    id: uuidv4(),
    name: "Müəllim Məlumatları",
    description: "Müəllimlərlə bağlı əsas məlumatlar",
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(), // 14 gün sonra
    status: "inactive",
    priority: 2,
    assignment: "sectors",
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: uuidv4(),
        categoryId: "cat2",
        name: "Müəllim sayı",
        type: "number",
        isRequired: true,
        order: 1,
        status: "active",
        validation: null
      },
      {
        id: uuidv4(),
        categoryId: "cat2",
        name: "Kişi müəllim sayı",
        type: "number",
        isRequired: false,
        order: 2,
        status: "active",
        validation: null
      }
    ]
  }
];

export const useDataEntryState = ({ formId, schoolId }: UseDataEntryStateProps): UseDataEntryStateReturn => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Supabase-dən məlumatları al
      // const { data, error } = await supabase
      //   .from('categories')
      //   .select('*');

      // Əgər xəta varsa, at
      // if (error) {
      //   throw error;
      // }

      // Mock məlumatları ilə əvəz et
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Categories adaptasiya etmə funksiyası
      const adaptCategories = (data: any[]): CategoryWithColumns[] => {
        return data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          assignment: category.assignment,
          deadline: category.deadline,
          status: category.status,
          priority: category.priority,
          created_at: category.createdAt || category.created_at || new Date().toISOString(),
          updated_at: category.updatedAt || category.updated_at || new Date().toISOString(),
          columns: category.columns.map((col: any) => ({
            id: col.id,
            category_id: col.categoryId || col.category_id,
            name: col.name,
            type: col.type,
            is_required: col.isRequired || col.is_required,
            order_index: col.order || col.order_index,
            status: col.status,
            validation: col.validationRules || col.validation,
            default_value: col.defaultValue || col.default_value,
            placeholder: col.placeholder,
            help_text: col.helpText || col.help_text,
            options: col.options,
            created_at: col.created_at || new Date().toISOString(),
            updated_at: col.updated_at || new Date().toISOString()
          }))
        }));
      };

      // Kategoriyaları təyin etdikdə adaptasiya edək
      const fetchedCategories = adaptCategories(mockCategoriesData);
      setCategories(fetchedCategories);

    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [formId, schoolId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchData
  };
};
