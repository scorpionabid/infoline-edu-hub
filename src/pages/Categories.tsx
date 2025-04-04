
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent } from '@/components/ui/card';
import CategoryList from '@/components/categories/CategoryList';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryStats from '@/components/categories/CategoryStats';
import CategoryAnalytics from '@/components/categories/CategoryAnalytics';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { useCategories } from '@/hooks/useCategories';
import { Category, CategoryFilter } from '@/types/category';
import { useCategoryActions } from '@/hooks/useCategoryActions';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Kateqoriyaları əldə etmək üçün hook
  const { 
    categories, 
    isLoading, 
    error, 
    refetch 
  } = useCategories();

  // Kateqoriyalar üzərində əməliyyatlar üçün hook
  const {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions(refetch);

  // Axtarış
  const handleSearch = (value: string) => {
    setSearch(value);
    setFilter((prev) => ({ ...prev, search: value }));
  };

  // Filter dəyişdirmə
  const handleFilterChange = (newFilter: CategoryFilter) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  };

  // Kateqoriya əlavə etmə
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  // Kateqoriya silmə
  const handleOpenDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Kateqoriya statusunu dəyişmə
  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'draft') => {
    try {
      await handleUpdateCategoryStatus(id, status);
      toast.success('Kateqoriya statusu uğurla yeniləndi');
    } catch (error: any) {
      toast.error(`Xəta: ${error.message}`);
    }
  };

  // Kateqoriya düzəlişi
  const handleEditCategory = (category: Category) => {
    navigate(`/columns?categoryId=${category.id}`);
  };

  // Filtrlənmiş kateqoriyalar
  const filteredCategories = categories.filter(category => {
    let matches = true;
    
    if (filter.status && filter.status !== category.status) {
      matches = false;
    }
    
    if (filter.assignment && filter.assignment !== category.assignment) {
      matches = false;
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (
        !category.name.toLowerCase().includes(searchLower) &&
        (!category.description || !category.description.toLowerCase().includes(searchLower))
      ) {
        matches = false;
      }
    }
    
    if (!filter.showArchived && category.archived) {
      matches = false;
    }
    
    return matches;
  });

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <CategoryHeader 
          search={search} 
          onSearchChange={handleSearch} 
          onAddCategory={handleOpenAddDialog}
          isLoading={isLoading || isActionLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                <CategoryList 
                  categories={filteredCategories}
                  isLoading={isLoading} 
                  onStatusChange={handleStatusChange}
                  onDelete={handleOpenDeleteDialog}
                  onEdit={handleEditCategory}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <CategoryFilterCard 
              filter={filter} 
              onFilterChange={handleFilterChange} 
            />
            
            <CategoryStats 
              categories={categories} 
              isLoading={isLoading}
            />
            
            <CategoryAnalytics 
              categories={categories} 
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Dialog boxes */}
        <AddCategoryDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          onAddCategory={handleAddCategory}
          isSubmitting={isActionLoading}
        />
        
        <DeleteCategoryDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          category={selectedCategory}
          onConfirm={handleDeleteCategory}
          isSubmitting={isActionLoading}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;
