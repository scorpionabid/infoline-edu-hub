
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useSchools } from '@/hooks/useSchools';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { Loader2 } from 'lucide-react';

const Schools = () => {
  const { t } = useLanguageSafe();
  const { user } = useAuth();
  const { schools, loading, error } = useSchools();

  return (
    <>
      <Helmet>
        <title>{t('schools')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-destructive text-lg">{t('errorOccurred')}</p>
              <p className="text-muted-foreground">{t('couldNotLoadSchools')}</p>
            </div>
          ) : (
            <SchoolsContainer />
          )}
        </div>
      </SidebarLayout>
    </>
  );
};

export default Schools;
