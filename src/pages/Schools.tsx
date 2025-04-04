
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SchoolsContainer from '@/components/schools/SchoolsContainer';

/**
 * Məktəblər Səhifəsi
 */
const Schools = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <SchoolsContainer />
        </div>
      </SidebarLayout>
    </>
  );
};

export default Schools;
