
import React, { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import CategoryList from "@/components/categories/CategoryList";
import CategoryHeader from "@/components/categories/CategoryHeader";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import { useCategories } from "@/hooks/useCategories";

const Categories = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
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
        />

        <AddCategoryDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAddCategory={handleAddCategory}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;
