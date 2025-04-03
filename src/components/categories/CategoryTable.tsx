
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Archive, Trash2, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Category } from '@/types/category';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { formatDateToLocale } from '@/utils/formatDateUtils';

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
  onDelete: (category: Category) => void;
  onView?: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ 
  categories, 
  isLoading, 
  error, 
  onEdit, 
  onArchive, 
  onDelete,
  onView 
}) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="py-4">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <h3 className="text-lg font-medium text-destructive">{t('errorOccurred')}</h3>
        <p className="text-muted-foreground">{t('couldNotLoadCategories')}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-8 text-center">
        <h3 className="text-lg font-medium">{t('noCategoriesFound')}</h3>
        <p className="text-muted-foreground">{t('tryAdjustingFilters')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('assignment')}</TableHead>
            <TableHead>{t('deadline')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>
                {category.assignment === 'all' ? t('all') : t('sectors')}
              </TableCell>
              <TableCell>
                {category.deadline ? formatDateToLocale(category.deadline) : '-'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={category.status === 'active' ? 'default' : 'outline'}
                  className={category.status === 'active' ? 'bg-green-500' : 'text-muted-foreground'}
                >
                  {category.status === 'active' ? t('active') : t('inactive')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <Button size="icon" variant="ghost" onClick={() => onView(category)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => onEdit(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onArchive(category)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(category)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
