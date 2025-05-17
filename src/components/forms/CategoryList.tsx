
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Settings, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryWithColumns } from '@/types/category';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface CategoryListProps {
  categories: CategoryWithColumns[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onEditCategory?: (category: CategoryWithColumns) => void;
  onDeleteCategory?: (category: CategoryWithColumns) => void;
  onViewDetails?: (category: CategoryWithColumns) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  isLoading,
  onRefresh,
  onEditCategory,
  onDeleteCategory,
  onViewDetails
}) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 hover:bg-green-100">{t('active')}</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100">{t('inactive')}</Badge>;
      case 'archived':
        return <Badge className="bg-red-50 text-red-700 hover:bg-red-100">{t('archived')}</Badge>;
      case 'draft':
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">{t('draft')}</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getAssignmentBadge = (assignment: string | undefined) => {
    switch (assignment) {
      case 'all':
        return <Badge variant="outline">{t('allEntities')}</Badge>;
      case 'sectors':
        return <Badge variant="outline">{t('sectors')}</Badge>;
      case 'schools':
        return <Badge variant="outline">{t('schools')}</Badge>;
      default:
        return <Badge variant="outline">{t('allEntities')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{t('noCategoriesFound')}</p>
            <Button onClick={() => onRefresh()}>
              {t('refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  {getStatusBadge(category.status)}
                  {getAssignmentBadge(category.assignment)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.description || t('noDescription')}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span>
                    {t('columns')}: {category.columnCount || 0}
                  </span>
                  {category.deadline && (
                    <span>
                      {t('deadline')}: {new Date(category.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 mt-3 sm:mt-0">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(category)}
                    title={t('viewDetails')}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">{t('viewDetails')}</span>
                  </Button>
                )}
                {onEditCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCategory(category)}
                    title={t('edit')}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{t('edit')}</span>
                  </Button>
                )}
                {onDeleteCategory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteCategory(category)}
                    title={t('delete')}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t('delete')}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
