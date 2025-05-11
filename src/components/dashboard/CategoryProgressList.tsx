
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CategoryItem } from '@/types/dashboard';
import { Badge } from '@/components/ui/badge';

interface CategoryProgressListProps {
  categories: CategoryItem[];
}

const CategoryProgressList: React.FC<CategoryProgressListProps> = ({ categories }) => {
  const { t } = useLanguage();
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 hover:bg-green-100';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'not-started':
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100';
      default:
        return 'bg-gray-50 text-gray-700 hover:bg-gray-100';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('completed');
      case 'in-progress':
        return t('inProgress');
      case 'not-started':
        return t('notStarted');
      default:
        return status;
    }
  };
  
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('categories')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>{t('noCategories')}</p>
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
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="font-medium">{category.name}</h3>
                  <Badge className={`ml-2 ${getBadgeVariant(category.status)}`} variant="outline">
                    {getStatusText(category.status)}
                  </Badge>
                </div>
                <span>{category.completionRate}%</span>
              </div>
              <Progress value={category.completionRate} className="h-2" />
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
              {category.deadline && (
                <p className="text-xs text-muted-foreground">
                  {t('deadline')}: {category.deadline}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryProgressList;
