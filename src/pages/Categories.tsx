
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { Category } from '@/types/category';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useCategoryFilters } from '@/hooks/categories/useCategoryFilters';
import { useCategoryOperations, AddCategoryFormData } from '@/hooks/categories/useCategoryOperations';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';

const Categories: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { userRole } = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [addDialog, setAddDialog] = useState({ isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, categoryId: '', categoryName: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Region admin və SuperAdmin kateqoriya əlavə və redaktə edə bilər
  const canManageCategories = userRole === 'superadmin' || userRole === 'regionadmin';

  // Custom hooklarımızı istifadə edək
  const {
    filter,
    handleFilterChange,
    searchQuery,
    handleSearchChange,
    date,
    handleDateChange
  } = useCategoryFilters();

  const {
    error,
    isSubmitting,
    fetchCategories,
    addCategory,
    deleteCategory,
    setError
  } = useCategoryOperations();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCategories(searchQuery, filter);
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, filter, searchQuery, setError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddDialog = () => {
    if (!canManageCategories) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    setAddDialog({ isOpen: true });
  };

  const handleCloseAddDialog = () => {
    setAddDialog({ isOpen: false });
  };

  const handleAddCategory = async (newCategory: AddCategoryFormData): Promise<boolean> => {
    if (!canManageCategories) {
      toast.error(t('noPermission'));
      return false;
    }
    
    const success = await addCategory(newCategory);
    if (success) {
      await fetchData();
    }
    return success;
  };

  const handleOpenDeleteDialog = (categoryId: string, categoryName: string) => {
    if (!canManageCategories) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    setDeleteDialog({ isOpen: true, categoryId: categoryId, categoryName: categoryName });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, categoryId: '', categoryName: '' });
  };

  const handleDeleteCategory = async (categoryId: string): Promise<boolean> => {
    if (!canManageCategories) {
      toast.error(t('noPermission'));
      return false;
    }
    
    const success = await deleteCategory(categoryId);
    if (success) {
      await fetchData();
    }
    return success;
  };

  const handleEditCategory = (categoryId: string) => {
    if (!canManageCategories) {
      toast.error(t('noPermission'), {
        description: t('adminPermissionRequired')
      });
      return;
    }
    navigate(`/categories/${categoryId}`);
  };

  const content = (
    <div>
      <PageHeader
        title={t('categories')}
        description={t('availableCategories')}
      >
        {canManageCategories && (
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addCategory')}
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <Input
          type="search"
          placeholder={t('search')}
          className="max-w-sm"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="flex flex-col md:flex-row gap-2">
          <Label htmlFor="status">{t('status')}:</Label>
          <Select 
            value={filter.status} 
            onValueChange={(value) => handleFilterChange({ status: value as any })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="assignment">{t('assignment')}:</Label>
          <Select 
            value={filter.assignment} 
            onValueChange={(value) => handleFilterChange({ assignment: value as any })}
          >
            <SelectTrigger id="assignment">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="sectors">Sectors</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="deadline">{t('deadline')}:</Label>
          <Select 
            value={filter.deadline} 
            onValueChange={(value) => handleFilterChange({ deadline: value as any })}
          >
            <SelectTrigger id="deadline">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      {!isLoading && categories.length === 0 && (
        <EmptyState
          icon={<Plus className="h-12 w-12" />}
          title={t('noCategoriesFound')}
          description={t('noCategoriesFoundDesc')}
          action={canManageCategories ? {
            label: t('addFirstCategory'),
            onClick: handleOpenAddDialog
          } : undefined}
        />
      )}

      {!isLoading && categories.length > 0 && (
        <CategoryTable 
          categories={categories}
          onEdit={handleEditCategory}
          onDelete={handleOpenDeleteDialog}
          canManageCategories={canManageCategories}
        />
      )}

      {addDialog.isOpen && (
        <AddCategoryDialog
          isOpen={addDialog.isOpen}
          onClose={handleCloseAddDialog}
          onAddCategory={handleAddCategory}
          isSubmitting={isSubmitting}
        />
      )}

      {deleteDialog.isOpen && (
        <DeleteCategoryDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteCategory}
          category={deleteDialog.categoryId}
          categoryName={deleteDialog.categoryName}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );

  return (
    <SidebarLayout>
      {content}
    </SidebarLayout>
  );
};

// Kategoriya cədvəli komponenti
const CategoryTable: React.FC<{
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  canManageCategories: boolean;
}> = ({ categories, onEdit, onDelete, canManageCategories }) => {
  const { t } = useLanguage();
  
  return (
    <div className="w-full">
      <Table>
        <TableCaption>A list of your categories.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>{category.status}</TableCell>
              <TableCell>
                {canManageCategories ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(category.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(category.id, category.name)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Yalnız baxış üçün</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Categories;
