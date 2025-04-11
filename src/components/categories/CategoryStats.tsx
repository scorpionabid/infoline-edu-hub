
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

export interface CategoryStatsProps {
  categories?: Category[];
}

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories = [] }) => {
  const { t } = useLanguage();
  
  // Kateqoriya statistikasını hesablayaq
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.status === 'active').length;
  const inactiveCategories = categories.filter(cat => cat.status === 'inactive').length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categoryStats')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('totalCategories')}</span>
            <span className="font-medium">{totalCategories}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('activeCategories')}</span>
            <span className="font-medium">{activeCategories}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('inactiveCategories')}</span>
            <span className="font-medium">{inactiveCategories}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryStats;
