import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddCategoryDialog from '@/components/categories/AddCategoryDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import { Category, CategoryStatus, CategoryFilter } from '@/types/category';
import { supabase } from '@/integrations/supabase/client';
import { EmptyState } from '@/components/common/EmptyState';
import PageHeader from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { DateRange } from 'react-day-picker';

const Categories: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [addDialog, setAddDialog] = useState({ isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, categoryId: '', categoryName: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>({
    status: 'all',
    assignment: 'all',
    deadline: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('categories')
        .select('*')
        .ilike('name', `%${searchQuery}%`);

      if (filter.status !== 'all') {
        query = query.eq('status', filter.status);
      }

      if (filter.assignment !== 'all') {
        query = query.eq('assignment', filter.assignment);
      }

      if (filter.deadline === 'upcoming') {
        query = query.gt('deadline', new Date().toISOString());
      } else if (filter.deadline === 'past') {
        query = query.lt('deadline', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorFetchingCategories'), {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchQuery, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddDialog = () => {
    setAddDialog({ isOpen: true });
  };

  const handleCloseAddDialog = () => {
    setAddDialog({ isOpen: false });
  };

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(t('categoryAddedSuccessfully'), {
        description: t('categoryAddedSuccessfullyDesc')
      });
      fetchData();
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorAddingCategory'), {
        description: err.message
      });
      return false;
    }
  };

  const handleOpenDeleteDialog = (categoryId: string, categoryName: string) => {
    setDeleteDialog({ isOpen: true, categoryId: categoryId, categoryName: categoryName });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, categoryId: '', categoryName: '' });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw new Error(error.message);
      }

      toast.success(t('categoryDeletedSuccessfully'), {
        description: t('categoryDeletedSuccessfullyDesc')
      });
      fetchData();
    } catch (err: any) {
      setError(err.message);
      toast.error(t('errorDeletingCategory'), {
        description: err.message
      });
    }
  };

  const handleEditCategory = (categoryId: string) => {
    navigate(`/categories/${categoryId}`);
  };

  const handleFilterChange = (newFilter: Partial<CategoryFilter>) => {
    setFilter({ ...filter, ...newFilter });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
  };

  return (
    <div>
      <PageHeader
        title={t('categories')}
        description={t('availableCategories')}
      >
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addCategory')}
        </Button>
      </PageHeader>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <Input
          type="search"
          placeholder={t('search')}
          className="max-w-sm"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <div className="flex items-center space-x-2">
          <Label htmlFor="status">{t('status')}:</Label>
          <Select onValueChange={(value) => handleFilterChange({ status: value })}>
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
          <Select onValueChange={(value) => handleFilterChange({ assignment: value })}>
            <SelectTrigger id="assignment">
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="sectors">Sectors</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="deadline">{t('deadline')}:</Label>
          <Select onValueChange={(value) => handleFilterChange({ deadline: value })}>
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
                onSelect={setDate}
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
          title={t('noCategoriesFound')}
          description={t('noCategoriesFoundDesc')}
          action={{
            label: t('addFirstCategory'),
            onClick: handleOpenAddDialog
          }}
        />
      )}

      {!isLoading && categories.length > 0 && (
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDeleteDialog(category.id, category.name)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add category dialoqu */}
      {addDialog.isOpen && (
        <AddCategoryDialog
          isOpen={addDialog.isOpen}
          onClose={handleCloseAddDialog}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* Silmə dialoqu */}
      {deleteDialog.isOpen && (
        <DeleteCategoryDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDeleteCategory}
          category={deleteDialog.categoryId} // categoryId property-ni category ilə əvəz edək
          categoryName={deleteDialog.categoryName}
        />
      )}
    </div>
  );
};

export default Categories;
