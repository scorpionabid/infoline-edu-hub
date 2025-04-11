
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CategoryList from '@/components/categories/CategoryList';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryStats from '@/components/categories/CategoryStats';
import CategoryChart from '@/components/categories/CategoryChart';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryDialog from '@/components/categories/CategoryDialog';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/category';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';

function Categories() {
  const { 
    categories,
    filteredCategories,
    searchQuery,
    setSearchQuery,
    isLoading, 
    error, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    isAddingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    canManageCategories
  } = useCategories();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { t } = useLanguage();

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm(t('confirmDeleteCategory'))) {
      deleteCategory(categoryId);
    }
  };

  const handleCategorySubmit = (data: any) => {
    if (selectedCategory) {
      updateCategory({ id: selectedCategory.id, updates: data });
    } else {
      addCategory(data);
    }
    setDialogOpen(false);
  };

  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      
      <div className="container mx-auto py-6">
        <CategoryHeader
          onAddCategory={handleAddCategory}
          canAddCategory={canManageCategories}
          searchValue={searchQuery}
          onSearchChange={(value) => setSearchQuery(value)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <CategoryList
              categories={filteredCategories}
              isLoading={isLoading}
              error={error}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              viewMode={viewMode}
              canManage={canManageCategories}
            />
          </div>
          
          <div className="space-y-6">
            <CategoryFilterCard 
              searchValue={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
            />
            
            <CategoryStats categories={categories} />
            
            <CategoryChart categories={categories} />
          </div>
        </div>
        
        <CategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          category={selectedCategory}
          onSubmit={handleCategorySubmit}
          isLoading={isAddingCategory || isUpdatingCategory}
        />
      </div>
    </SidebarLayout>
  );
}

export default Categories;
