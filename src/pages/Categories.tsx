
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useCategories } from '@/hooks/useCategories';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryGrid from '@/components/categories/CategoryGrid';
import CategoryList from '@/components/categories/CategoryList';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryStats from '@/components/categories/CategoryStats';
import CategoryChart from '@/components/categories/CategoryChart';
import CategoryDialog from '@/components/categories/CategoryDialog';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { Category } from '@/types/category';

const Categories = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchValue, setSearchValue] = useState('');
  
  const { 
    categories, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    canManageCategories,
    filteredCategories
  } = useCategories(searchValue);
  
  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      await updateCategory({
        id: updatedCategory.id,
        updates: updatedCategory
      });
      setIsDialogOpen(false);
      setSelectedCategory(null);
      toast.success(t('categoryUpdated'));
    } catch (error: any) {
      toast.error(t('categoryUpdateError'), {
        description: error.message
      });
    }
  };
  
  const handleCreateCategory = async (newCategory: Category) => {
    try {
      await addCategory(newCategory);
      setIsDialogOpen(false);
      toast.success(t('categoryCreated'));
    } catch (error: any) {
      toast.error(t('categoryCreateError'), {
        description: error.message
      });
    }
  };
  
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
    setIsDialogOpen(true);
  };
  
  // Category obyekti ilə işləyən deleteCategory üçün wrapper
  const handleDeleteCategory = (category: Category) => {
    deleteCategory(category.id);
  };
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      
      <CategoryHeader 
        onAddCategory={() => handleOpenDialog()}
        canAddCategory={canManageCategories} 
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            <CategoryGrid 
              categories={filteredCategories} 
              isLoading={isLoading} 
              onEdit={handleOpenDialog}
              onDelete={handleDeleteCategory}
            />
          ) : (
            <CategoryList 
              categories={filteredCategories} 
              isLoading={isLoading} 
              onEdit={handleOpenDialog}
              onDelete={handleDeleteCategory}
            />
          )}
        </div>
        
        <div className="space-y-6">
          <CategoryFilterCard 
            searchValue={searchValue}
            onSearchChange={(value) => setSearchValue(value)} 
          />
          
          <CategoryStats categories={categories} />
          
          <CategoryChart categories={categories} />
        </div>
      </div>
      
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        isLoading={isLoading}
      />
    </SidebarLayout>
  );
};

export default Categories;
