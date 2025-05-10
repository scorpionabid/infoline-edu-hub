
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { PlusCircle } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import useCategoryActions from '@/hooks/categories/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryColumns } from './CategoryColumns';
import { CategoryStatus } from '@/types/category';

export const CategoryList = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    categories,
    loading: categoriesLoading,
    error,
    fetchCategories
  } = useCategories();

  const {
    deleteCategory,
    updateCategoryStatus,
    isLoading: actionsLoading
  } = useCategoryActions();
  
  const isLoading = categoriesLoading || actionsLoading;

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Refetch categories
  const refetch = () => {
    fetchCategories();
  };

  useEffect(() => {
    refetch();
  }, []);

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleUpdateCategoryStatus = async (id: string, status: CategoryStatus) => {
    try {
      await updateCategoryStatus(id, status);
      refetch();
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{currentLanguage === 'az' ? 'Kateqoriyalar' : 'Categories'}</h1>
        <Button onClick={() => navigate('/categories/new')}><PlusCircle className="mr-2 h-4 w-4" /> {t('addCategory')}</Button>
      </div>
      <DataTable
        columns={CategoryColumns({
          onDelete: handleDeleteCategory,
          onUpdateStatus: handleUpdateCategoryStatus,
          isLoading,
          refetch
        })}
        data={filteredCategories}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
    </div>
  );
};

export default CategoryList;
