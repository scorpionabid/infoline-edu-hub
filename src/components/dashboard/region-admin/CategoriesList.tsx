
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryStat } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface CategoriesListProps {
  categories: CategoryStat[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  const { t } = useLanguage();
  
  // Default colors for categories if not provided
  const defaultColors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100'];
  const defaultTextColors = ['text-blue-800', 'text-green-800', 'text-yellow-800', 'text-purple-800', 'text-pink-800'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noCategories')}
            </div>
          ) : (
            categories.map((category, index) => {
              const colorIndex = index % defaultColors.length;
              const bgColor = defaultColors[colorIndex];
              const textColor = defaultTextColors[colorIndex];
              
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${bgColor}`}></div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-sm ${textColor}`}>
                      {category.completionRate}%
                    </span>
                  </div>
                  <Progress value={category.completionRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {t('schoolsParticipating', { count: category.totalSchools })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesList;
