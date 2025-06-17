
import React, { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';

const DataEntry: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>{t('auth.please_login')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('navigation.dataEntry')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataEntryContainer 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntry;
