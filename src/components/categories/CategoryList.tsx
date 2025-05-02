import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/DataTable';
import { PlusCircle } from 'lucide-react';
import useCategories from '@/hooks/categories/useCategories';
import { useCategoryActions } from '@/hooks/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/useToast';
import categories from '@/translations/az/categories';

export const CategoryList = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const {
    getCategories,
    deleteCategory,
  } = useCategories();
  const {
    isActionLoading,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{currentLanguage === 'az' ? 'Kategorilər' : 'Categories'}</h1>
        <Button onClick={() => navigate('/categories/new')}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
      </div>
      <DataTable
        columns={CategoryColumns({
          onDelete: handleDeleteCategory,
          onUpdateStatus: handleUpdateCategoryStatus,
          isLoading: isActionLoading,
          refetch: getCategories
        })}
        data={categories()}
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default CategoryList;
