
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import { Helmet } from 'react-helmet';

const DataEntryPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('dataEntry')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
        <p className="text-muted-foreground">{t('dataEntryPageDescription')}</p>
      </div>
    </SidebarLayout>
  );
};

export default DataEntryPage;
