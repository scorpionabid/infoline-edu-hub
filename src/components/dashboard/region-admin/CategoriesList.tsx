
import React from 'react';
import { CategoryStat } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CategoriesListProps {
  categories: CategoryStat[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        {categories && categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{category.name}</div>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      backgroundColor: `${category.color}20`, 
                      color: category.color,
                      borderColor: `${category.color}40` 
                    }}
                  >
                    {category.completionRate}%
                  </Badge>
                </div>
                <Progress 
                  value={category.completionRate} 
                  className="h-2"
                  style={{ 
                    backgroundColor: `${category.color}20`,
                    '--progress-background': category.color,
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">{t('noCategories')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoriesList;
