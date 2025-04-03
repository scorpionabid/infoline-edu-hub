
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardContent } from '@/components/ui/card';
import SidebarLayout from '@/components/layout/SidebarLayout';
import CategoryHeader from '@/components/categories/CategoryHeader';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import CategoryList from '@/components/categories/CategoryList';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { useCategoriesData } from '@/hooks/categories/useCategoriesData';
import { CategoryFilter } from '@/types/dataEntry';
import { Category } from '@/types/category';

const Categories = () => {
  const { toast } = useToast();

  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);

  // Filter state
  const [filters, setFilters] = useState<CategoryFilter>({
    status: undefined,
    assignment: undefined,
    search: '',
    showArchived: false
  });

  // Categories data with loading state
  const { categories, isLoading, isError, fetchCategories, createCategory, updateCategory, deleteCategory, archiveCategory } = useCategoriesData();

  // Filter categories based on filters
  const filteredCategories = React.useMemo(() => {
    let result = [...categories];

    if (filters.status) {
      result = result.filter((category) => category.status === filters.status);
    }

    if (filters.assignment) {
      result = result.filter((category) => category.assignment === filters.assignment);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter((category) => category.name.toLowerCase().includes(searchTerm));
    }

    if (!filters.showArchived) {
      result = result.filter((category) => !category.archived);
    }

    return result;
  }, [categories, filters]);

  // Handler for filter changes
  const handleFilterChange = (filterName: keyof CategoryFilter, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: undefined,
      assignment: undefined,
      search: '',
      showArchived: false
    });
  };

  // Handle category creation
  const handleCategoryCreate = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      await createCategory(categoryData);
      setIsAddDialogOpen(false);
      toast({
        title: 'Kateqoriya yaradıldı',
        description: `${categoryData.name} kateqoriyası uğurla yaradıldı.`
      });
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriya yaradılmadı. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Handle category update
  const handleCategoryUpdate = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> & { id: string }) => {
    try {
      await updateCategory(categoryData);
      toast({
        title: 'Kateqoriya yeniləndi',
        description: `Kateqoriya uğurla yeniləndi.`
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

  // Handle category deletion
  const handleCategoryDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Kateqoriya silindi',
        description: categoryToDelete ? `${categoryToDelete.name} kateqoriyası uğurla silindi.` : 'Kateqoriya silindi'
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

  // Open delete dialog
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete({
      id: category.id,
      name: category.name
    });
    setIsDeleteDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsAddDialogOpen(true);
  };

  // Handle archive toggling
  const handleArchiveToggle = async (category: Category) => {
    try {
      await archiveCategory(category.id, !category.archived);
      toast({
        title: category.archived ? 'Kateqoriya arxivdən çıxarıldı' : 'Kateqoriya arxivləndi',
        description: `${category.name} kateqoriyası uğurla ${category.archived ? 'arxivdən çıxarıldı' : 'arxivləndi'}.`
      });
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast({
        title: 'Xəta baş verdi',
        description: 'Kateqoriyanın arxiv statusu dəyişdirilmədi. Xahiş edirik yenidən cəhd edin.',
        variant: 'destructive'
      });
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-4">
        <CategoryHeader 
          onAddClick={() => {
            setSelectedCategory(null);
            setIsAddDialogOpen(true);
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          <CategoryFilterCard 
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            showLoading={isLoading}
          />
          
          <ScrollArea className="h-[calc(100vh-13rem)]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] rounded-md" />
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              ) : isError ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 text-center"
                >
                  <p className="text-lg text-red-500 mb-2">Məlumatlar yüklənmədi</p>
                  <p className="text-sm text-muted-foreground mb-4">Xəta baş verdi. Xahiş edirik yenidən cəhd edin.</p>
                  <button 
                    onClick={() => fetchCategories()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                  >
                    Yenidən cəhd et
                  </button>
                </motion.div>
              ) : filteredCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 text-center"
                >
                  <p className="text-lg mb-2">Kateqoriya tapılmadı</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filters.search ? `"${filters.search}" üzrə axtarış nəticəsi tapılmadı` : 'Filtrlərə uyğun kateqoriya yoxdur'}
                  </p>
                  
                  {(filters.status || filters.assignment || filters.search || filters.showArchived) && (
                    <button 
                      onClick={resetFilters}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
                    >
                      Filtrləri sıfırla
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CategoryList 
                    categories={filteredCategories}
                    onEditCategory={openEditDialog}
                    onDeleteCategory={openDeleteDialog}
                    onArchiveToggle={handleArchiveToggle}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </div>

      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={selectedCategory ? 
          (data) => handleCategoryUpdate({ ...data, id: selectedCategory.id }) : 
          handleCategoryCreate}
        onClose={() => setIsAddDialogOpen(false)}
        category={selectedCategory}
      />

      <DeleteCategoryDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleCategoryDelete}
        categoryId={categoryToDelete?.id || ''}
        categoryName={categoryToDelete?.name || ''}
      />
    </SidebarLayout>
  );
};

export default Categories;
