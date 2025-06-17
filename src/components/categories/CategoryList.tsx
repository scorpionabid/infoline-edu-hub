
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryListProps {
  categories: any[];
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onCategorySelect }) => {
  const { t } = useTranslation();

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
