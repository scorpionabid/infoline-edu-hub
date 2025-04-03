
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { v4 as uuid } from 'uuid';
import { Category } from '@/types/category';

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Fetch all categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // Mock fetch - in a real app, this would call an API or DB service
      setTimeout(() => {
        const mockCategories: Category[] = [
          {
            id: 'cat1',
            name: 'Ümumi məlumatlar',
            description: 'Məktəb haqqında ümumi məlumatlar',
            assignment: 'all',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            status: 'active',
            priority: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 1,
            archived: false
          },
          {
            id: 'cat2',
            name: 'Müəllim heyəti',
            description: 'Müəllimlər haqqında məlumatlar',
            assignment: 'sectors',
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
            status: 'active',
            priority: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 2,
            archived: false
          },
          {
            id: 'cat3',
            name: 'Şagird heyəti',
            description: 'Şagirdlər haqqında məlumatlar',
            assignment: 'all',
            deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
            status: 'inactive',
            priority: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: 3,
            archived: false
          }
        ];

        setCategories(mockCategories);
        setIsLoading(false);
      }, 800);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setIsError(true);
      setIsLoading(false);
      toast({
        title: t('error'),
        description: t('errorFetchingCategories'),
        variant: 'destructive',
      });
    }
  };

  // Fetch a single category by ID
  const fetchSingleCategory = async (categoryId: string): Promise<Category | null> => {
    try {
      // Mock fetch for a single category - in a real app, this would call an API or DB service
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) {
        // If not found in local state, we could fetch it from the server
        console.log(`Category ${categoryId} not found in local state`);
      }
      return category || null;
    } catch (err: any) {
      console.error('Error fetching category:', err);
      toast({
        title: t('error'),
        description: t('errorFetchingCategory'),
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create a new category
  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Mock create - in a real app, this would call an API or DB service
      const newCategory: Category = {
        ...categoryData,
        id: uuid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      console.error('Error creating category:', err);
      toast({
        title: t('error'),
        description: t('errorCreatingCategory'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update an existing category
  const updateCategory = async (categoryData: Partial<Category> & { id: string }) => {
    try {
      // Mock update - in a real app, this would call an API or DB service
      setCategories(prev => prev.map(cat => 
        cat.id === categoryData.id 
          ? { ...cat, ...categoryData, updatedAt: new Date().toISOString() } 
          : cat
      ));
      return categoryData;
    } catch (err: any) {
      console.error('Error updating category:', err);
      toast({
        title: t('error'),
        description: t('errorUpdatingCategory'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
    try {
      // Mock delete - in a real app, this would call an API or DB service
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return true;
    } catch (err: any) {
      console.error('Error deleting category:', err);
      toast({
        title: t('error'),
        description: t('errorDeletingCategory'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Archive/unarchive a category
  const archiveCategory = async (categoryId: string, archive: boolean) => {
    try {
      // Mock archive - in a real app, this would call an API or DB service
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, archived: archive, updatedAt: new Date().toISOString() } 
          : cat
      ));
      return true;
    } catch (err: any) {
      console.error('Error archiving category:', err);
      toast({
        title: t('error'),
        description: archive ? t('errorArchivingCategory') : t('errorUnarchivingCategory'),
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

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
