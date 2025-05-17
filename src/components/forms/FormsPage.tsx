
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Category, CategoryStatus } from '@/types/category';
import { useCategories } from '@/hooks/categories';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import CategoryCard from './CategoryCard';
import CreateCategoryDialog from '@/components/categories/CreateCategoryDialog';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';

const FormsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { canManageCategories } = usePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'active' as CategoryStatus,
    assignment: ''
  });

  const { categories, isLoading, refetch } = useCategories(
    filters.status ? { status: filters.status } : undefined
  );

  const filteredCategories = categories.filter(category => {
    // Filter by search term in name or description
    if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        (!category.description || !category.description.toLowerCase().includes(filters.search.toLowerCase()))) {
      return false;
    }

    // Filter by status (active, inactive, etc.)
    if (filters.status && category.status !== filters.status) {
      return false;
    }

    // Filter by assignment (schools, sectors, all)
    if (filters.assignment && category.assignment !== filters.assignment) {
      return false;
    }

    return true;
  });

  const handleCreateCategory = async () => {
    await refetch();
    setDialogOpen(false);
  };

  const navigateToDataEntry = (categoryId: string) => {
    navigate(`/data-entry/${categoryId}`);
  };

  const navigateToDetails = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dataForms')}</h1>
          <p className="text-muted-foreground">{t('dataFormsDescription')}</p>
        </div>

        {canManageCategories && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('createForm')}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <CategoryFilterCard 
            filters={filters}
            onChange={setFilters}
            showAssignmentFilter={true}
          />
        </div>

        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onSubmit={navigateToDataEntry}
                  onView={navigateToDetails}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed">
              <h3 className="font-medium text-lg mb-2">{t('noFormsFound')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filters.search || filters.status !== 'active' || filters.assignment
                  ? t('noMatchingForms')
                  : t('noFormsAvailable')}
              </p>
              {canManageCategories && (
                <Button onClick={() => setDialogOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createForm')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCategoryCreated={handleCreateCategory}
      />
    </div>
  );
};

export default FormsPage;
