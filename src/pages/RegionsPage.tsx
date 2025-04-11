
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';

const RegionsPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">{t('regions')}</h1>
        <p className="text-muted-foreground">{t('regionsPageDescription')}</p>
      </div>
    </SidebarLayout>
  );
};

export default RegionsPage;
