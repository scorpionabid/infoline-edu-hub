
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CategoryList from '@/components/categories/CategoryList';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryStats from '@/components/categories/CategoryStats';
import CategoryChart from '@/components/categories/CategoryChart';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import EditCategoryDialog from '@/components/categories/EditCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { Category, CategoryFilter, CategoryStatus } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryActions } from '@/hooks/useCategoryActions';
import { useLanguage } from '@/context/LanguageContext';
import CategoryHeader from '@/components/categories/CategoryHeader';

const Categories: React.FC = () => {
  const { 
    categories, 
    filteredCategories,
    isLoading, 
    error, 
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    stats
  } = useCategories();
  
  const {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions();
  
  const { t } = useLanguage();
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Handlers
  const handleAddDialogOpen = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditDialogOpen = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteDialogOpen = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Type-safe status filter handler
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as CategoryStatus | 'all');
  };
  
  // Type-safe assignment filter handler
  const handleAssignmentFilterChange = (value: string) => {
    setAssignmentFilter(value as 'all' | 'sectors' | '');
  };
  
  return (
    <SidebarLayout>
      <div className="container mx-auto py-6 space-y-6">
        <CategoryHeader
          onAddCategory={handleAddDialogOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={handleAssignmentFilterChange}
          isLoading={isLoading}
        />
        
        <CategoryStats 
          stats={stats}
          isLoading={isLoading} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryChart 
            categoriesData={categories} 
            loading={isLoading} 
          />
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">{t('filterCategories')}</h2>
              <CategoryFilterCard 
                filter={{
                  search: searchQuery,
                  status: statusFilter,
                  assignment: assignmentFilter,
                  deadline: 'all'
                }}
                onFilterChange={(newFilter) => {
                  if (newFilter.search !== undefined) setSearchQuery(newFilter.search);
                  if (newFilter.status !== undefined) setStatusFilter(newFilter.status);
                  if (newFilter.assignment !== undefined) setAssignmentFilter(newFilter.assignment);
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <CategoryList 
          categories={filteredCategories} 
          isLoading={isLoading}
          onEdit={handleEditDialogOpen} 
          onDelete={handleDeleteDialogOpen}
          handleStatusChange={handleUpdateCategoryStatus}
        />
        
        <AddCategoryDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAddCategory={handleAddCategory}
          isSubmitting={isActionLoading}
        />
        
        <EditCategoryDialog 
          isOpen={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)} 
          onEditCategory={handleAddCategory}
          category={selectedCategory}
          isSubmitting={isActionLoading}
        />
        
        <DeleteCategoryDialog 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)} 
          onConfirm={handleDeleteCategory}
          category={selectedCategory}
          isSubmitting={isActionLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;
