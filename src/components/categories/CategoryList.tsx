
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CategoryAssignment, CategoryStatus, CategoryFilter } from '@/types/category';
import { ArchiveIcon, Edit, EyeIcon, Plus, Search, Trash } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CategoryListProps {
  categories: Category[];
  onAddCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onArchiveCategory?: (categoryId: string) => void;
  onViewCategory?: (categoryId: string) => void;
  loading?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onArchiveCategory,
  onViewCategory,
  loading = false,
}) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<CategoryFilter>({
    status: '',
    assignment: '',
    archived: false,
    showArchived: false,
    search: ''
  });

  // Filter metodları
  const filterCategories = (categories: Category[], filters: CategoryFilter): Category[] => {
    return categories.filter(category => {
      const searchMatch = !filters.search || 
        category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const statusMatch = !filters.status || category.status === filters.status;
      
      let assignmentMatch = true;
      if (filters.assignment) {
        // "specific" statusunu filterdən çıxartmaq və yalnız "all" və "sectors" ilə filtirləmək
        assignmentMatch = filters.assignment === '' || category.assignment === filters.assignment;
      }
      
      const archivedMatch = filters.showArchived ? true : !category.archived;
      
      return searchMatch && statusMatch && assignmentMatch && archivedMatch;
    });
  };

  const filteredCategories = filterCategories(categories, filters);

  const updateFilter = (newFilters: Partial<CategoryFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilter = () => {
    setFilters({
      status: '',
      assignment: '',
      archived: false,
      showArchived: false,
      search: ''
    });
  };

  // Category status sinfini əldə etmək
  const getCategoryStatusClassName = (status: CategoryStatus, archived: boolean) => {
    if (archived) {
      return 'bg-gray-200 text-gray-700';
    }
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between">
          <CardTitle className="text-2xl font-bold">{t('categories')}</CardTitle>
          <Button onClick={onAddCategory}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addCategory')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-1 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCategories')}
                value={filters.search || ''}
                onChange={(e) => updateFilter({ search: e.target.value })}
                className="w-full pl-9"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Select
              value={filters.status || ''}
              onValueChange={(value) => updateFilter({ status: value as CategoryStatus })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allStatuses')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="inactive">{t('inactive')}</SelectItem>
                <SelectItem value="archived">{t('archived')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.assignment || ''}
              onValueChange={(value) => updateFilter({ assignment: value as '' | 'all' | 'sectors' })}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('selectAssignment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allAssignments')}</SelectItem>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="sectors">{t('sectors')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={resetFilter}
              disabled={!filters.status && !filters.assignment && !filters.search}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('assignment')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t('loading')}...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t('noCategoriesFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="pl-8">
                      <Checkbox
                        checked={!category.archived}
                        onCheckedChange={() => {
                          if (onArchiveCategory) {
                            onArchiveCategory(category.id);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Badge className={cn(getCategoryStatusClassName(category.status, category.archived))}>
                        {t(category.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{t(category.assignment)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onViewCategory && onViewCategory(category.id)}>
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEditCategory && onEditCategory(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteCategory && onDeleteCategory(category.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-archived"
              checked={Boolean(filters.showArchived)}
              onCheckedChange={(checked) => updateFilter({ showArchived: !!checked })}
            />
            <Label htmlFor="show-archived" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              {t('showArchived')}
            </Label>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredCategories.length} {t('categories')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
