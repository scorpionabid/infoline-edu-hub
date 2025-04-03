
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArchiveX, CheckCircle, Trash2, Edit, CircleSlash } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSection from '@/components/common/LoadingSection';
import NoDataFound from '@/components/common/NoDataFound';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import EditCategoryDialog from '@/components/categories/EditCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { CategoryWithOrder } from '@/types/category';
import { useCategories, useCategoryOperations } from '@/hooks/useCategories';
import { formatDate } from '@/lib/utils';
import CategoryFilterCard from '@/components/categories/CategoryFilterCard';
import { CategoryFilter } from '@/types/dataEntry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Categories = () => {
  const { t } = useLanguage();
  
  // Kategoriya filtrləri və əməliyyatları
  const [filters, setFilters] = useState<CategoryFilter>({
    status: '',
    assignment: '',
    search: '',
    withDeadline: false,
    showArchived: false
  });
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithOrder | null>(null);
  
  const { categories, loading, error, refetch } = useCategories();
  const { addCategory, updateCategory, deleteCategory, archiveCategory, restoreCategory } = useCategoryOperations();
  
  // Filtrlənmiş kategoriyalar
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => {
      // Axtarışa görə filtr
      if (filters.search && !category.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Statusuna görə filtr
      if (filters.status && category.status !== filters.status) {
        return false;
      }
      
      // Təyinatına görə filtr
      if (filters.assignment && category.assignment !== filters.assignment) {
        return false;
      }
      
      // Arxivlənmiş göstərilsinmi?
      if (!filters.showArchived && category.archived) {
        return false;
      }
      
      return true;
    });
  }, [categories, filters]);
  
  // Kategoriya filtrini təyin etmək
  const handleFilterChange = (filterName: keyof CategoryFilter, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  // Filtrləri sıfırlamaq
  const resetFilters = () => {
    setFilters({
      status: '',
      assignment: '',
      search: '',
      withDeadline: false,
      showArchived: false
    });
  };
  
  // Kategoriya əlavə et
  const handleAddCategory = async (category: CategoryWithOrder) => {
    try {
      await addCategory(category);
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  };
  
  // Kategoriyanı redaktə et
  const handleUpdateCategory = async (updatedCategory: CategoryWithOrder) => {
    try {
      await updateCategory(updatedCategory);
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  };
  
  // Kategoriyanı sil
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  };
  
  // Kategoriyanı arxivlə
  const handleArchiveCategory = async (categoryId: string) => {
    try {
      await archiveCategory(categoryId);
      refetch();
      return true;
    } catch (error) {
      console.error('Error archiving category:', error);
      return false;
    }
  };
  
  // Kategoriyanı arxivdən çıxart
  const handleRestoreCategory = async (categoryId: string) => {
    try {
      await restoreCategory(categoryId);
      refetch();
      return true;
    } catch (error) {
      console.error('Error restoring category:', error);
      return false;
    }
  };
  
  // Kateqoriya redaktə dialoqunu aç
  const openEditDialog = (category: CategoryWithOrder) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };
  
  // Kateqoriya silmə dialoqunu aç
  const openDeleteDialog = (category: CategoryWithOrder) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  // Filtrlənmiş kateqoriyaları təyin etmək üçün köməkçi funksiya
  const getFilteredByStatusCategories = (status: string) => {
    return filteredCategories.filter(cat => cat.status === status);
  };
  
  // Aktiv, deaktiv və arxivlənmiş kateqoriyalar
  const activeCategories = getFilteredByStatusCategories('active');
  const inactiveCategories = getFilteredByStatusCategories('inactive');
  const archivedCategories = filteredCategories.filter(cat => cat.archived);
  
  if (loading) {
    return <LoadingSection title={t('categories')} description={t('loadingCategories')} />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <PageHeader title={t('categories')} description={t('errorLoadingCategories')} />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <PageHeader 
        title={t('categories')} 
        description={t('categoriesDescription')}
        actions={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('addCategory')}
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <CategoryFilterCard 
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" className="relative">
                {t('active')}
                <Badge variant="secondary" className="ml-2">{activeCategories.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="relative">
                {t('inactive')}
                <Badge variant="secondary" className="ml-2">{inactiveCategories.length}</Badge>
              </TabsTrigger>
              {filters.showArchived && (
                <TabsTrigger value="archived" className="relative">
                  {t('archived')}
                  <Badge variant="secondary" className="ml-2">{archivedCategories.length}</Badge>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="active">
              {activeCategories.length === 0 ? (
                <NoDataFound 
                  title={t('noCategoriesFound')} 
                  description={t('tryChangingFilters')}
                  action={
                    <Button onClick={() => setIsAddDialogOpen(true)}>{t('addCategory')}</Button>
                  }
                />
              ) : (
                <CategoryTable 
                  categories={activeCategories} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog}
                  onArchive={handleArchiveCategory}
                  onRestore={handleRestoreCategory}
                  showArchived={filters.showArchived}
                />
              )}
            </TabsContent>
            
            <TabsContent value="inactive">
              {inactiveCategories.length === 0 ? (
                <NoDataFound 
                  title={t('noInactiveCategoriesFound')} 
                  description={t('tryChangingFilters')}
                />
              ) : (
                <CategoryTable 
                  categories={inactiveCategories} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog}
                  onArchive={handleArchiveCategory}
                  onRestore={handleRestoreCategory}
                  showArchived={filters.showArchived}
                />
              )}
            </TabsContent>
            
            {filters.showArchived && (
              <TabsContent value="archived">
                {archivedCategories.length === 0 ? (
                  <NoDataFound 
                    title={t('noArchivedCategoriesFound')} 
                    description={t('noArchivedCategoriesDescription')}
                  />
                ) : (
                  <CategoryTable 
                    categories={archivedCategories} 
                    onEdit={openEditDialog} 
                    onDelete={openDeleteDialog}
                    onArchive={handleArchiveCategory}
                    onRestore={handleRestoreCategory}
                    showArchived={filters.showArchived}
                  />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <AddCategoryDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCategory}
        onClose={() => setIsAddDialogOpen(false)}
      />
      
      {selectedCategory && (
        <>
          <EditCategoryDialog 
            isOpen={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            category={selectedCategory}
            onSubmit={handleUpdateCategory}
            onClose={() => setIsEditDialogOpen(false)}
          />
          
          <DeleteCategoryDialog 
            isOpen={isDeleteDialogOpen} 
            onOpenChange={setIsDeleteDialogOpen}
            category={selectedCategory}
            onConfirm={() => handleDeleteCategory(selectedCategory.id)}
            onClose={() => setIsDeleteDialogOpen(false)}
          />
        </>
      )}
    </div>
  );
};

type CategoryTableProps = {
  categories: CategoryWithOrder[];
  onEdit: (category: CategoryWithOrder) => void;
  onDelete: (category: CategoryWithOrder) => void;
  onArchive: (categoryId: string) => Promise<boolean>;
  onRestore: (categoryId: string) => Promise<boolean>;
  showArchived: boolean;
};

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  onEdit, 
  onDelete,
  onArchive,
  onRestore,
  showArchived
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">{t('name')}</th>
              <th className="px-4 py-3 text-left">{t('assignment')}</th>
              <th className="px-4 py-3 text-left">{t('deadline')}</th>
              <th className="px-4 py-3 text-left">{t('priority')}</th>
              <th className="px-4 py-3 text-left">{t('status')}</th>
              <th className="px-4 py-3 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className={category.archived ? 'bg-muted/50' : ''}>
                <td className="px-4 py-3 font-medium">
                  <div className="flex flex-col">
                    <span>{category.name}</span>
                    {category.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{category.description}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {category.assignment === 'all' ? (
                    <Badge variant="outline">{t('general')}</Badge>
                  ) : (
                    <Badge variant="secondary">{t('sectors')}</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {category.deadline ? formatDate(category.deadline) : '-'}
                </td>
                <td className="px-4 py-3">{category.priority}</td>
                <td className="px-4 py-3">
                  {category.archived ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300">
                      <ArchiveX className="h-3 w-3 mr-1" />
                      {t('archived')}
                    </Badge>
                  ) : category.status === 'active' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('active')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                      <CircleSlash className="h-3 w-3 mr-1" />
                      {t('inactive')}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {category.archived ? (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onRestore(category.id)}
                        title={t('restore')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(category)}
                          title={t('edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onArchive(category.id)}
                          title={t('archive')}
                        >
                          <ArchiveX className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(category)}
                      title={t('delete')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
