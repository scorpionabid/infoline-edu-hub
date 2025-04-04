
import React from 'react';
import { Helmet } from 'react-helmet';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useLanguage } from '@/context/LanguageContext';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportList from '@/components/reports/ReportList';
import SchoolColumnTable from '@/components/reports/SchoolColumnTable';

/**
 * Hesabatlar Səhifəsi
 */
const Reports = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('reports')} | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <div className="container mx-auto py-6">
          <ReportHeader />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <ReportList />
            </div>
            <div className="md:col-span-2">
              <SchoolColumnTable categories={[]} schoolData={[]} />
            </div>
          </div>
        </div>
      </SidebarLayout>
    </>
  );
};

export default Reports;
