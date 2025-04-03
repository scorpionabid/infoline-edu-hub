
// Düzəltmək: import { AddCategoryDialog as default } from '@/components/categories/AddCategoryDialog';
// Doğrusu:
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Archive, Trash2 } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CategoryTable from '@/components/categories/CategoryTable';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryPagination from '@/components/categories/CategoryPagination';
import CategoryFilters from '@/components/categories/CategoryFilters';
import { useCategoriesData } from '@/hooks/categories/useCategoriesData';
import { Category } from '@/types/category';
import { CategoryFilter } from '@/types/dataEntry'; // CategoryFilter tipini dataEntry-dən import edirik
import { EditCategoryDialog } from '@/components/categories/EditCategoryDialog';
import { ArchiveCategoryDialog } from '@/components/categories/ArchiveCategoryDialog';
import { DeleteCategoryDialog } from '@/components/categories/DeleteCategoryDialog';

const Categories = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<CategoryFilter>({
    assignment: '',
    status: '',
    archived: false,
    showArchived: false,
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Data hooks
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    deleteCategory
  } = useCategoriesData();

  // Pagination
  const itemsPerPage = 10;
  const totalItems = categories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination logic
  const paginatedCategories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categories.slice(startIndex, endIndex);
  }, [categories, currentPage, itemsPerPage]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, filters]);

  // Handlers
  const handleAddCategory = async (categoryData: any) => {
    try {
      await createCategory(categoryData);
      toast({
        title: 'Kateqoriya əlavə edildi',
        description: `${categoryData.name} adlı kateqoriya uğurla əlavə edildi.`
      });
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriya əlavə edilmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleUpdateCategory = async (categoryData: Category) => {
    try {
      await updateCategory(categoryData);
      toast({
        title: 'Kateqoriya yeniləndi',
        description: `${categoryData.name} adlı kateqoriya uğurla yeniləndi.`
      });
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriya yenilənmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleArchiveCategory = async (categoryId: string) => {
    try {
      await archiveCategory(categoryId);
      toast({
        title: 'Kateqoriya arxivləndi',
        description: 'Kateqoriya uğurla arxivləndi.'
      });
      return true;
    } catch (error) {
      console.error('Error archiving category:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriya arxivlənmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      toast({
        title: 'Kateqoriya silindi',
        description: 'Kateqoriya uğurla silindi.'
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriya silinmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleFiltersChange = (newFilters: CategoryFilter) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Open dialogs
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const openArchiveDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsArchiveDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <CategoryHeader
          onAddCategory={() => setIsAddDialogOpen(true)}
        />

        <CategoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        <CategoryTable
          categories={paginatedCategories}
          isLoading={isLoading}
          error={error}
          onEdit={openEditDialog}
          onArchive={openArchiveDialog}
          onDelete={openDeleteDialog}
        />

        {totalPages > 1 && (
          <CategoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <AddCategoryDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddCategory={handleAddCategory}
      />

      {selectedCategory && (
        <>
          <EditCategoryDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            category={selectedCategory}
            onUpdateCategory={handleUpdateCategory}
            onClose={handleCloseEditDialog}
          />

          <ArchiveCategoryDialog
            open={isArchiveDialogOpen}
            onOpenChange={setIsArchiveDialogOpen}
            category={selectedCategory}
            onArchiveCategory={handleArchiveCategory}
          />

          <DeleteCategoryDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            category={selectedCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </>
      )}
    </SidebarLayout>
  );
};

export default Categories;
