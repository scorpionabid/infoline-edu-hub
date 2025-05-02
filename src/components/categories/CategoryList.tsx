
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/data-table';
import { PlusCircle } from 'lucide-react';
import useCategories from '@/hooks/categories/useCategories';
import { useCategoryActions } from '@/hooks/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryColumns } from './CategoryColumns';

export const CategoryList = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  
  const {
    categories,
    filteredCategories,
    isLoading,
    searchQuery,
    setSearchQuery,
    refetch
  } = useCategories();

  const {
    isActionLoading,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions();

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
          isLoading: isActionLoading,
          refetch: refetch
        })}
        data={filteredCategories || categories}
        isLoading={isLoading || isActionLoading}
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
    </div>
  );
};

export default CategoryList;
