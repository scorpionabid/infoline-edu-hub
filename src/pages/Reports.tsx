
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportList from '@/components/reports/ReportList';
import { useLanguage } from '@/context/LanguageContext';

const Reports: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <ReportHeader />
        <ReportList />
      </div>
    </SidebarLayout>
  );
};

export default Reports;
