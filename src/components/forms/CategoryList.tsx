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

  function formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      return String(date);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                  </div>
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
          <div className="p-8 text-center">
            <p className="mb-4 text-muted-foreground">{t('noCategories')}</p>
            <Button onClick={() => window.location.reload()}>
              <Plus className="mr-2 h-4 w-4" />
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
            <div key={category.id} className="p-4 border rounded-lg">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex space-x-2">
                      {getStatusBadge(category.status)}
                      {category.assignment && getAssignmentBadge(category.assignment)}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <span>{t('columns')}: {category.column_count || 0}</span>
                    {category.deadline && <span>{t('deadline')}: {formatDate(category.deadline)}</span>}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {onViewDetails && (
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(category)}>
                      <Settings className="h-4 w-4 mr-1" />
                      {t('manage')}
                    </Button>
                  )}
                  {onEditCategory && (
                    <Button variant="outline" size="sm" onClick={() => onEditCategory(category)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      {t('edit')}
                    </Button>
                  )}
                  {onDeleteCategory && (
                    <Button variant="outline" size="sm" onClick={() => onDeleteCategory(category)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('delete')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryList;
