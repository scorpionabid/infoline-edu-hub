
import React, { ReactNode, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/column';
import { Edit, FileEdit, Trash, Calendar, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { getBadgeVariantFromStatus } from '@/lib/utils/ui';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

// Props
interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string, name: string) => void;
  onViewColumns: (categoryId: string) => void;
  canManageCategories: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onViewColumns,
  canManageCategories,
}) => {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  if (isError) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-destructive font-medium text-lg">
          {t('errorLoadingCategories')}
        </p>
        <p className="text-muted-foreground mt-1">
          {t('pleaseTryAgainLater')}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">{t('name')}</TableHead>
              <TableHead>{t('description')}</TableHead>
              <TableHead className="w-[100px]">{t('columns')}</TableHead>
              <TableHead className="w-[100px]">{t('target')}</TableHead>
              <TableHead className="w-[120px]">{t('deadline')}</TableHead>
              <TableHead className="w-[100px]">{t('status')}</TableHead>
              <TableHead className="w-[120px] text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">{t('noCategoriesFound')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">{t('name')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead className="w-[100px]">{t('columns')}</TableHead>
            <TableHead className="w-[100px]">{t('target')}</TableHead>
            <TableHead className="w-[120px]">{t('deadline')}</TableHead>
            <TableHead className="w-[100px]">{t('status')}</TableHead>
            <TableHead className="w-[120px] text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className={expandedCategory === category.id ? "bg-muted/50" : ""}
            >
              <TableCell className="font-medium">
                {category.name}
              </TableCell>
              <TableCell>
                {category.description || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  {category.column_count || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {category.target === 'sectors' ? t('sectors') : t('all')}
                </Badge>
              </TableCell>
              <TableCell>
                {category.deadline ? (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">
                      {formatDate(category.deadline as string, 'dd.MM.yyyy')}
                    </span>
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariantFromStatus(category.status as string)}>
                  {t(category.status || 'draft')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewColumns(category.id)}
                    title={t('viewColumns')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {canManageCategories && (
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
                        onClick={() => onDelete(category.id, category.name)}
                        title={t('delete')}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryList;
