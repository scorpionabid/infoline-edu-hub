
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { PlusCircle } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import useCategoryActions from '@/hooks/categories/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryColumns } from './CategoryColumns';

export const CategoryList = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  
  const {
    categories,
    filteredCategories,
    isLoading: categoriesLoading,
    searchQuery,
    setSearchQuery,
    refetch
  } = useCategories();

  const {
    deleteCategory,
    updateCategoryStatus,
    isLoading: actionsLoading
  } = useCategoryActions();
  
  const isLoading = categoriesLoading || actionsLoading;

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleUpdateCategoryStatus = async (id: string, status: string) => {
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
        <Button onClick={() => navigate('/categories/new')}><PlusCircle className="mr-2 h-4 w-4" /> Kateqoriya əlavə et</Button>
      </div>
      <DataTable
        columns={CategoryColumns({
          onDelete: handleDeleteCategory,
          onUpdateStatus: handleUpdateCategoryStatus,
          isLoading,
          refetch
        })}
        data={filteredCategories || categories}
        isLoading={isLoading}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
    </div>
  );
};

export default CategoryList;
