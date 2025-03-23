
import React, { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import CategoryList from "@/components/categories/CategoryList";
import CategoryHeader from "@/components/categories/CategoryHeader";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import { useCategories } from "@/hooks/useCategories";
import { Category, CategoryFilter } from "@/types/category";

const Categories = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>({
    search: '',
    status: '',
    showArchived: false,
    assignment: ''
  });
  
  const { 
    filteredCategories,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategories();

  const handleEditCategory = (category: Category) => {
    setEditCategory(category);
    setIsAddDialogOpen(true);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <CategoryHeader
          onAddCategory={() => setIsAddDialogOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />

        <CategoryList
          categories={filteredCategories}
          isLoading={isLoading}
          isError={isError}
          onDeleteCategory={handleDeleteCategory}
          onUpdateStatus={handleUpdateCategoryStatus}
          onEditCategory={handleEditCategory}
          filter={filter}
        />

        <AddCategoryDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditCategory(null);
          }}
          onAddCategory={handleAddCategory}
          editCategory={editCategory}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;
