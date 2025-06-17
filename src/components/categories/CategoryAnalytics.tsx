
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryAnalyticsProps {
  categoryId: string;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({ categoryId }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories.analytics')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{t('categories.analytics_description')}</p>
      </CardContent>
    </Card>
  );
};

export default CategoryAnalytics;
