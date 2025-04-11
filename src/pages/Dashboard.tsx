
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('dashboard')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6">
        <DashboardHeader />
        <DashboardContent />
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
