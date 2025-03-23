
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData 
} from '@/hooks/useDashboardData';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import DashboardTabs from './DashboardTabs';

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
  isLoading
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Data entry səhifəsinə keçid
  const navigateToDataEntry = () => {
    navigate('/data-entry');
    toast.success(t('navigatingToDataEntry'), {
      description: t('navigatingToDataEntryDesc')
    });
  };

  // Form-a keçid funksiyası - Data entry səhifəsinə yönləndirir və form ID-sini ötürür
  const handleFormClick = (formId: string) => {
    navigate(`/data-entry?formId=${formId}`);
    toast.info(t('openingForm'), {
      description: `${t('formId')}: ${formId}`
    });
  };

  // Yüklənmə zamanı göstəriləcək
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'superadmin': {
        const superAdminData = dashboardData as SuperAdminDashboardData;
        return <SuperAdminDashboard data={superAdminData} />;
      }
      case 'regionadmin': {
        const regionAdminData = dashboardData as RegionAdminDashboardData;
        return <RegionAdminDashboard data={regionAdminData} />;
      }
      case 'sectoradmin': {
        const sectorAdminData = dashboardData as SectorAdminDashboardData;
        return <SectorAdminDashboard data={sectorAdminData} />;
      }
      case 'schooladmin': {
        const schoolAdminData = dashboardData as SchoolAdminDashboardData;
        return (
          <SchoolAdminDashboard 
            data={schoolAdminData}
            navigateToDataEntry={navigateToDataEntry}
            handleFormClick={handleFormClick}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {userRole === 'superadmin' && (
        <DashboardTabs 
          activityData={chartData.activityData}
          regionSchoolsData={chartData.regionSchoolsData}
          categoryCompletionData={chartData.categoryCompletionData}
        />
      )}
      
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
