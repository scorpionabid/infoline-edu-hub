
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import RegionHeader from '@/components/regions/RegionHeader';

/**
 * Regionlar Səhifəsi
 */
const Regions = () => {
  const { t } = useLanguage();
  
  const handleAddRegion = () => {
    // Yeni region əlavə etmə məntiqi
    console.log('Yeni region əlavə edilir...');
  };

  return (
    <>
      <Helmet>
        <title>{t('regions')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <RegionHeader t={t} onAddRegion={handleAddRegion} />
        </div>
      </SidebarLayout>
    </>
  );
};

export default Regions;
