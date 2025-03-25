
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { 
  DashboardData,
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
import { Notification as DashboardNotification } from './NotificationsCard';
import { Notification } from '@/types/notification';

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

// Notification formatını uyğunlaşdırma funksiyası
const adaptNotifications = (notifications: Notification[]): DashboardNotification[] => {
  return notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: notification.createdAt
  }));
};

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
        const adaptedNotifications = adaptNotifications(superAdminData.notifications || []);
        const preparedData = {
          ...superAdminData,
          notifications: adaptedNotifications
        };
        return <SuperAdminDashboard data={preparedData} />;
      }
      case 'regionadmin': {
        const regionAdminData = dashboardData as RegionAdminDashboardData;
        const adaptedNotifications = adaptNotifications(regionAdminData.notifications || []);
        const preparedData = {
          ...regionAdminData,
          notifications: adaptedNotifications
        };
        return <RegionAdminDashboard data={preparedData} />;
      }
      case 'sectoradmin': {
        const sectorAdminData = dashboardData as SectorAdminDashboardData;
        const adaptedNotifications = adaptNotifications(sectorAdminData.notifications || []);
        const preparedData = {
          ...sectorAdminData,
          notifications: adaptedNotifications
        };
        return <SectorAdminDashboard data={preparedData} />;
      }
      case 'schooladmin': {
        const schoolAdminData = dashboardData as SchoolAdminDashboardData;
        const adaptedNotifications = adaptNotifications(schoolAdminData.notifications || []);
        const preparedData = {
          ...schoolAdminData,
          notifications: adaptedNotifications
        };
        return (
          <SchoolAdminDashboard 
            data={preparedData}
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
      {userRole === 'superadmin' && chartData && (
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
