
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SchoolAdminDashboardComponent from '@/components/dashboard/school-admin/SchoolAdminDashboard';
import { useSchoolAdminDashboard } from '@/hooks/dashboard/useSchoolAdminDashboard';
import FormTabs from '@/components/dashboard/school-admin/FormTabs';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/context/LanguageContext';
import { Form } from '@/types/form';

const SchoolAdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useSchoolAdminDashboard();
  
  const handleNavigateToDataEntry = useCallback(() => {
    navigate('/data-entry');
  }, [navigate]);
  
  const handleFormClick = useCallback((formId: string) => {
    navigate(`/data-entry/${formId}`);
  }, [navigate]);
  
  // Məlumatlardan Form obyektləri yaradırıq
  const recentForms: Form[] = data.pendingForms.map(form => ({
    id: form.id,
    title: form.title,
    category: form.category,
    status: form.status as any,
    completionPercentage: form.completionPercentage,
    date: form.date,
    deadline: undefined // data-dan deadline əldə edilsə buraya əlavə edilə bilər
  }));
  
  return (
    <SidebarLayout>
      <Helmet>
        <title>{t('schoolAdminDashboard')} | InfoLine</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-8">
        <SchoolAdminDashboardComponent
          data={data}
          isLoading={isLoading}
          error={error}
          onRefresh={refetch}
          navigateToDataEntry={handleNavigateToDataEntry}
          handleFormClick={handleFormClick}
        />
        
        {!isLoading && !error && (
          <FormTabs 
            recentForms={recentForms} 
            handleFormClick={handleFormClick} 
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default SchoolAdminDashboard;
