
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, FileDown, X } from 'lucide-react';
import CategoryList from '@/components/categories/CategoryList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CategoryFilter } from '@/types/category';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { exportCategoriesToExcel } from '@/utils/excelExport';
import CategoryForm from '@/components/categories/CategoryForm';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const Categories = () => {
  const { t } = useLanguage();
  
  // Category handling
  const {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory: apiDeleteCategory,
    updateCategory: apiUpdateCategory
  } = useCategories();
  
  // Editing state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter state
  const [filter, setFilter] = useState<CategoryFilter>({
    status: undefined,
    assignment: undefined,
    search: '',
    showArchived: false
  });
  
  // Open the form for a new category
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };
  
  // Open the form for editing
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };
  
  // Handle form submission
  const handleFormSubmit = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
        toast.success(t('categoryUpdated'));
      } else {
        // Add new category with all required fields
        await addCategory({
          name: categoryData.name,
          description: categoryData.description || '',
          assignment: categoryData.assignment,
          deadline: categoryData.deadline || '',
          status: categoryData.status || 'active',
          priority: categoryData.priority || 1,
          order: categoryData.order || 0 // Fixed: Add order property
        });
        toast.success(t('categoryAdded'));
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(t('operationFailed'));
      console.error('Error submitting category:', error);
    }
  };
  
  // Handle category deletion - burada funksiya adını dəyişdirdik
  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    toast({
      description: `${t('deletingCategory')}: ${categoryName}`
    });
    
    try {
      await apiDeleteCategory(categoryId);
      return true; // success
    } catch (error) {
      console.error('Error deleting category:', error);
      return false; // failed
    }
  };
  
  // Handle status update
  const handleUpdateStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      await apiUpdateCategory(id, { status });
      return true; // success
    } catch (error) {
      console.error('Error updating status:', error);
      return false; // failed
    }
  };
  
  // Handle Excel export
  const handleExportToExcel = () => {
    try {
      exportCategoriesToExcel(categories);
      toast.success(t('categoriesExported'));
    } catch (error) {
      toast.error(t('exportFailed'));
      console.error('Export error:', error);
    }
  };
  
  // Update filter
  const updateFilter = (newFilter: Partial<CategoryFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  // Reset filter
  const resetFilter = () => {
    setFilter({
      status: undefined,
      assignment: undefined,
      search: '',
      showArchived: false
    });
  };
  
  // Stats for the header
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.status === 'active').length,
    inactive: categories.filter(c => c.status === 'inactive').length,
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('categories')}</h1>
          <p className="text-muted-foreground">{t('categoriesDescription')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddCategory} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            {t('addCategory')}
          </Button>
          <Button variant="outline" onClick={handleExportToExcel} className="flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            {t('exportToExcel')}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('totalCategories')}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.total}</p>
              )}
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">{stats.total}</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('activeCategories')}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.active}</p>
              )}
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 text-lg px-3 py-1">
              {stats.active}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('inactiveCategories')}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{stats.inactive}</p>
              )}
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-lg px-3 py-1">
              {stats.inactive}
            </Badge>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            placeholder={t('searchCategories')}
            value={filter.search}
            onChange={e => updateFilter({ search: e.target.value })}
            className="max-w-sm"
          />
          {filter.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => updateFilter({ search: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={filter.status || 'all'}
            onValueChange={(value) => updateFilter({ status: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="approved">{t('approved')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="rejected">{t('rejected')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.assignment || 'all'}
            onValueChange={(value) => {
              // Handle assignment filter with proper type conversion
              if (value === 'all') {
                updateFilter({ assignment: undefined });
              } else if (value === 'sectors' || value === 'all') {
                // Only allow 'sectors' or 'all' as valid values
                updateFilter({ assignment: value });
              }
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('assignment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAssignments')}</SelectItem>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              <SelectItem value="sectors">{t('sectorsOnly')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filter.showArchived ? 'archived' : 'active'}
            onValueChange={(value) => updateFilter({ showArchived: value === 'archived' })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t('archiveStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('hideArchived')}</SelectItem>
              <SelectItem value="archived">{t('showArchived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Category List */}
      <CategoryList 
        categories={categories} 
        onEditCategory={handleEditCategory} 
        filter={filter}
        isLoading={loading}
        isError={!!error}
        onDeleteCategory={handleDeleteCategory}
        onUpdateStatus={handleUpdateStatus}
      />
      
      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <CategoryForm 
          category={editingCategory}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />
      </Dialog>
    </div>
  );
};

export default Categories;
