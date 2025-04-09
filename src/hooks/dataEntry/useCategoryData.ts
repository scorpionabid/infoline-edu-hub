import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/column';
import { useAuth } from '@/context/AuthContext';

interface UseCategoryDataReturn {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  error: Error | null;
}

const mockCategoriesData = [
  {
    id: '1',
    name: 'Şagird Məlumatları',
    description: 'Şagirdlərlə bağlı əsas məlumatlar',
    assignment: 'all',
    deadline: '2024-12-31',
    status: 'active',
    priority: 1,
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: '101',
        categoryId: '1',
        name: 'Ad',
        type: 'text',
        isRequired: true,
        order: 1,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '102',
        categoryId: '1',
        name: 'Soyad',
        type: 'text',
        isRequired: true,
        order: 2,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    name: 'Müəllim Məlumatları',
    description: 'Müəllimlərlə bağlı əsas məlumatlar',
    assignment: 'all',
    deadline: '2024-12-31',
    status: 'active',
    priority: 2,
    createdAt: new Date().toISOString(),
    columns: [
      {
        id: '201',
        categoryId: '2',
        name: 'Ad',
        type: 'text',
        isRequired: true,
        order: 1,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '202',
        categoryId: '2',
        name: 'Soyad',
        type: 'text',
        isRequired: true,
        order: 2,
        status: 'active',
        validationRules: { maxLength: 50 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
];

export const useCategoryData = (): UseCategoryDataReturn => {
  const [categories, setMockCategories] = useState<CategoryWithColumns[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Supabase-dən kateqoriyaları al
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select(`
            id,
            name,
            description,
            assignment,
            deadline,
            status,
            priority,
            createdAt:created_at,
            updatedAt:updated_at,
            columns (
              id,
              categoryId:category_id,
              name,
              type,
              isRequired:is_required,
              order:order_index,
              status,
              validationRules:validation,
              defaultValue:default_value,
              placeholder,
              helpText:help_text,
              options,
              createdAt:created_at,
              updatedAt:updated_at
            )
          `);

        if (categoriesError) {
          throw new Error(categoriesError.message);
        }

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
            created_at: category.createdAt || category.created_at,
            updated_at: category.updatedAt || category.updated_at,
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

        // setMockCategories funksiyasında adaptasiya edək
        setMockCategories(adaptCategories(mockCategoriesData));

        // Əgər məlumat varsa, onu state-ə yaz
        if (categoriesData) {
          // Adaptasiya funksiyasını istifadə edərək state-i yenilə
          setMockCategories(adaptCategories(categoriesData));
        }
      } catch (err: any) {
        setError(err);
        console.error("Kateqoriyaları əldə etmə xətası:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user]);

  return { categories, isLoading, error };
};
