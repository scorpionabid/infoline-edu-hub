import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { CategoryColumns } from './CategoryColumns';
import { PlusCircle } from 'lucide-react';
import { EditCategoryDialog } from './EditCategoryDialog';
import { useCategories } from '@/hooks/categories/useCategories';
import { useCategoryActions } from '@/hooks/useCategoryActions';
import { Category } from '@/types/category';

export const CategoryList = () => {
  const navigate = useNavigate();
  const {
    categories,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    filteredCategories,
    refetch
  } = useCategories();
  const {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading categories...</div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center h-64">Error: {error?.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => navigate('/categories/new')}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>
      <DataTable
        columns={CategoryColumns({
          onDelete: handleDeleteCategory,
          onUpdateStatus: handleUpdateCategoryStatus,
          isLoading: isActionLoading,
          refetch
        })}
        data={filteredCategories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </div>
  );
};

export default CategoryList;
