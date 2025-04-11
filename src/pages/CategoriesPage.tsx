
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';

const CategoriesPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('categories')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">{t('categories')}</h1>
        <p className="text-muted-foreground">{t('categoriesPageDescription')}</p>
      </div>
    </SidebarLayout>
  );
};

export default CategoriesPage;
