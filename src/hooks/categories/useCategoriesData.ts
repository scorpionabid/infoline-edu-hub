
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import { Category } from '@/types/column';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Mock data - in a real app, this would be an API call
      setTimeout(() => {
        const mockCategories: Category[] = [
          {
            id: 'cat1',
            name: 'Ümumi məlumatlar',
            description: 'Məktəb haqqında ümumi məlumatlar',
            assignment: 'all',
            priority: 1,
            status: 'active',
            deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 1
          },
          {
            id: 'cat2',
            name: 'Müəllim heyəti',
            description: 'Müəllim heyəti haqqında məlumatlar',
            assignment: 'sectors',
            priority: 2,
            status: 'active',
            deadline: new Date(Date.now() + 20*24*60*60*1000).toISOString(),
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 2
          }
        ];

        setCategories(mockCategories);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setIsError(true);
      setIsLoading(false);
      toast.error('Kateqoriyalar yüklənərkən xəta baş verdi');
    }
  }, []);

  // Fetch a single category
  const fetchSingleCategory = useCallback(async (categoryId: string): Promise<Category | null> => {
    setIsLoading(true);
    
    try {
      // Mock data - in a real app, this would be an API call
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockCategory = categories.find(c => c.id === categoryId) || {
            id: categoryId,
            name: 'Test kateqoriyası',
            description: 'Test təsviri',
            assignment: 'all' as const,
            priority: 1,
            status: 'active',
            deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 1
          };
          
          setIsLoading(false);
          resolve(mockCategory);
        }, 500);
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      setIsLoading(false);
      toast.error('Kateqoriya yüklənərkən xəta baş verdi');
      return null;
    }
  }, [categories]);

  // Create a new category
  const createCategory = useCallback(async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: categoryData.priority || 1 // Order xassəsini təminat altına alırıq
      };
      
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Kateqoriya yaradılarkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Update an existing category
  const updateCategory = useCallback(async (categoryData: Partial<Category> & { id: string }) => {
    try {
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryData.id 
            ? { 
                ...cat, 
                ...categoryData, 
                updatedAt: new Date().toISOString(),
                // Əgər priority yenilənibsə, order-i də yeniləyirik
                order: categoryData.priority !== undefined ? categoryData.priority : cat.order
              } 
            : cat
        )
      );
      
      return categoryData;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Kateqoriya yenilənərkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: string, categoryName: string) => {
    try {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success(`"${categoryName}" kateqoriyası silindi`);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kateqoriya silinərkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Archive/unarchive a category
  const archiveCategory = useCallback(async (categoryId: string, archived: boolean) => {
    try {
      setCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                archived,
                updatedAt: new Date().toISOString() 
              } 
            : cat
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error changing archive status:', error);
      toast.error('Kateqoriyanın arxiv statusu dəyişdirilkən xəta baş verdi');
      throw error;
    }
  }, []);

  // Initial data load
  const initialize = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load data on mount
  useState(() => {
    initialize();
  });

  return {
    categories,
    isLoading,
    isError,
    fetchCategories,
    fetchSingleCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    archiveCategory
  };
};

export default useCategoriesData;
