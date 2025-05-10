
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/categories/useCategories';
import useCategoryActions from '@/hooks/categories/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryColumns } from './CategoryColumns';
import { CategoryStatus } from '@/types/category';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

export const CategoryList = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRetries, setLoadingRetries] = useState(0);
  
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    fetchCategories
  } = useCategories();

  const {
    deleteCategory,
    updateCategoryStatus,
    isLoading: actionsLoading
  } = useCategoryActions();
  
  const isLoading = categoriesLoading || actionsLoading;

  // Filter categories based on search query
  const filteredCategories = categories?.filter(category => 
    category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category?.description && category?.description.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Refetch categories
  const refetch = () => {
    console.log("Refetching categories with archived: false");
    fetchCategories({ archived: false });
  };

  // Retry loading if categories fail to load
  useEffect(() => {
    if (categoriesError && loadingRetries < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying category fetch (attempt ${loadingRetries + 1})`);
        setLoadingRetries(prev => prev + 1);
        refetch();
      }, Math.pow(2, loadingRetries) * 1000); // Exponential backoff
      return () => clearTimeout(timer);
    }
  }, [categoriesError, loadingRetries]);

  useEffect(() => {
    console.log("Initial categories fetch");
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

  if (categoriesError && loadingRetries >= 3) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {t('errorLoadingCategories')}: {categoriesError}
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
          {t('tryAgain')}
        </Button>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{currentLanguage === 'az' ? 'Kateqoriyalar' : 'Categories'}</h1>
        <Button onClick={() => navigate('/categories/new')}><PlusCircle className="mr-2 h-4 w-4" /> {t('addCategory')}</Button>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p>{t('loadingCategories')}</p>
        </div>
      ) : categories && categories.length === 0 ? (
        <Alert className="mb-4">
          <Info className="h-4 w-4 mr-2" />
          <AlertDescription>
            {t('noCategories')}
          </AlertDescription>
        </Alert>
      ) : (
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
      )}
      
      {categoriesError && !isLoading && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {categoriesError}
          </AlertDescription>
          <Button variant="outline" size="sm" onClick={refetch} className="ml-auto">
            {t('retry')}
          </Button>
        </Alert>
      )}
    </div>
  );
};

export default CategoryList;
