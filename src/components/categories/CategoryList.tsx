
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CategoryListProps {
  categories?: any[];
  onCategorySelect?: (categoryId: string) => void;
  isLoading?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({ 
  categories = [], 
  onCategorySelect,
  isLoading = false 
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t('loading')}...</span>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>{t('noCategories')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategorySelect?.(category.id)}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('categories.column_count')}: {category.column_count || 0}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryList;
