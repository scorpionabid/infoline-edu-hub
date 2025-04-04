
import React from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import RegionHeader from '@/components/regions/RegionHeader';

/**
 * Regionlar Səhifəsi
 */
const Regions = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <RegionHeader />
        </div>
      </SidebarLayout>
    </>
  );
};

export default Regions;
