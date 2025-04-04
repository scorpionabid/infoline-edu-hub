import React from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Sektorlar Səhifəsi
 */
const Sectors = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('sectors')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold tracking-tight">{t('sectors')}</h1>
          {/* Sector content will be added here */}
        </div>
      </SidebarLayout>
    </>
  );
};

export default Sectors;
