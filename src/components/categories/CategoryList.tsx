
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CategoryStatus, CategoryAssignment, CategoryFilter } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { Archive, DotsHorizontal, Edit, Eye, Layers, Plus, RefreshCw, Trash } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface CategoryListProps {
  categories: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (category: any) => void;
  onView: (id: string) => void;
  onArchive: (id: string) => void;
  onAdd: () => void;
}

export function CategoryList({ categories, isLoading, onDelete, onEdit, onView, onArchive, onAdd }: CategoryListProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<CategoryFilter>({
    status: '',
    assignment: '',
    archived: false,
    showArchived: false,
    search: ''
  });
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Filter categories based on filter state
  useEffect(() => {
    let result = [...categories];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(cat => cat.name.toLowerCase().includes(searchLower));
    }

    if (filter.status) {
      result = result.filter(cat => cat.status === filter.status);
    }

    if (filter.assignment && filter.assignment !== '') {
      result = result.filter(cat => cat.assignment === filter.assignment);
    }

    if (!filter.showArchived) {
      result = result.filter(cat => !cat.archived);
    }

    setFilteredCategories(result);
  }, [categories, filter, refreshTrigger]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CategoryFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    setSelectedCategoryId(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (selectedCategoryId) {
      onDelete(selectedCategoryId);
      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);
      toast.success(t('categoryDeletedSuccess'), {
        description: t('categoryDeletedDescription')
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      status: '',
      assignment: '',
      archived: false,
      showArchived: false,
      search: ''
    });
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <input
            type="text"
            placeholder={t('searchCategories')}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={filter.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={filter.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">{t('allStatuses')}</option>
            <option value="active">{t('active')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={filter.assignment}
            onChange={(e) => handleFilterChange('assignment', e.target.value as '' | 'all' | 'sectors')}
          >
            <option value="">{t('allAssignments')}</option>
            <option value="all">{t('allSchools')}</option>
            <option value="sectors">{t('sectorSchools')}</option>
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showArchived"
              checked={filter.showArchived || false}
              onChange={(e) => handleFilterChange('showArchived', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showArchived" className="text-sm font-medium">
              {t('showArchived')}
            </label>
          </div>

          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RefreshCw className="h-4 w-4 mr-1" /> {t('reset')}
          </Button>
        </div>
      </div>

      {/* Add Category Button */}
      <div className="flex justify-end">
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" /> {t('addCategory')}
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('assignment')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('columns')}</TableHead>
              <TableHead>{t('deadline')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">{t('loading')}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">{t('noCategories')}</p>
                    <Button
                      variant="outline" 
                      size="sm"
                      className="mt-4"
                      onClick={onAdd}
                    >
                      <Plus className="h-4 w-4 mr-2" /> {t('addCategory')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category.assignment === 'all' ? t('allSchools') : (
                        category.assignment === 'sectors' ? t('sectorSchools') : t('specificSchools')
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {category.archived ? (
                      <Badge variant="default">{t('archived')}</Badge>
                    ) : category.status === 'active' ? (
                      <Badge variant="success">{t('active')}</Badge>
                    ) : (
                      <Badge variant="secondary">{t('inactive')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.column_count || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {category.deadline ? new Date(category.deadline).toLocaleDateString() : t('noDeadline')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsHorizontal className="h-4 w-4" />
                          <span className="sr-only">{t('openMenu')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(category.id)}>
                          <Eye className="h-4 w-4 mr-2" /> {t('view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="h-4 w-4 mr-2" /> {t('edit')}
                        </DropdownMenuItem>
                        {!category.archived && (
                          <DropdownMenuItem onClick={() => onArchive(category.id)}>
                            <Archive className="h-4 w-4 mr-2" /> {t('archive')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmationMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700" 
              onClick={confirmDelete}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
