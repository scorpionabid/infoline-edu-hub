
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import DashboardTabs from './DashboardTabs';
import useSchoolAdminDashboard from '@/hooks/useSchoolAdminDashboard';

interface DashboardContentProps {
  userRole: string | undefined;
  dashboardData: any;
  chartData: {
    activityData: { name: string; value: number }[];
    regionSchoolsData: { name: string; value: number }[];
    categoryCompletionData: { name: string; completed: number }[];
  };
  isLoading: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  userRole,
  dashboardData,
  chartData,
  isLoading: mockDataLoading
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { 
    data: schoolAdminData,
    isLoading: schoolAdminLoading,
    error: schoolAdminError,
    refetch: refreshSchoolAdminData,
    handleFormClick,
    navigateToDataEntry
  } = useSchoolAdminDashboard();

  const isLoading = userRole === 'schooladmin' ? schoolAdminLoading : mockDataLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    
    try {
      switch (normalizedRole) {
        case 'superadmin':
          return <SuperAdminDashboard data={dashboardData || {}} />;
        case 'regionadmin':
          return <RegionAdminDashboard data={dashboardData || {}} />;
        case 'sectoradmin':
          return <SectorAdminDashboard data={dashboardData || {}} />;
        case 'schooladmin':
          return (
            <SchoolAdminDashboard 
              data={schoolAdminData}
              isLoading={schoolAdminLoading}
              error={schoolAdminError}
              onRefresh={refreshSchoolAdminData}
              navigateToDataEntry={navigateToDataEntry}
              handleFormClick={handleFormClick}
            />
          );
        default:
          console.warn(`Naməlum istifadəçi rolu: "${userRole}". SchoolAdmin dashboard göstərilir.`);
          return (
            <SchoolAdminDashboard 
              data={null}
              isLoading={false}
              error={new Error(t('unknownUserRole'))}
              onRefresh={() => window.location.reload()}
              navigateToDataEntry={() => navigate('/data-entry')}
              handleFormClick={(id) => navigate(`/data-entry/${id}`)}
            />
          );
      }
    } catch (error) {
      console.error("Dashboard render xətası:", error);
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-destructive text-lg">{t('errorOccurred')}</p>
          <p className="text-muted-foreground">{t('dashboardRenderError')}</p>
        </div>
      );
    }
  };

  const safeChartData = {
    activityData: Array.isArray(chartData?.activityData) ? chartData.activityData : [],
    regionSchoolsData: Array.isArray(chartData?.regionSchoolsData) ? chartData.regionSchoolsData : [],
    categoryCompletionData: Array.isArray(chartData?.categoryCompletionData) ? chartData.categoryCompletionData : []
  };

  return (
    <div className="space-y-4">
      {userRole === 'superadmin' && chartData && (
        <DashboardTabs 
          activityData={safeChartData.activityData}
          regionSchoolsData={safeChartData.regionSchoolsData}
          categoryCompletionData={safeChartData.categoryCompletionData}
        />
      )}
      
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
