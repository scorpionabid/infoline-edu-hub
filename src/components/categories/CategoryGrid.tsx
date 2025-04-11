
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Layers } from 'lucide-react';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryGridProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex justify-between border-t p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex space-x-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (categories.length === 0) {
    return (
      <Card className="text-center p-6">
        <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('noCategoriesFound')}</p>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <Card key={category.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <Badge variant={category.status === 'active' ? 'outline' : 'secondary'}>
                {category.status === 'active' ? t('active') : t('inactive')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {category.description || t('noDescription')}
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span className="mr-4">{t('columnCount')}: {category.column_count || 0}</span>
              <span>{t('assignment')}: {category.assignment === 'all' ? t('all') : t('sectors')}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-2">
            <div>
              {category.deadline && (
                <Badge variant="outline" className="text-xs">
                  {new Date(category.deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
