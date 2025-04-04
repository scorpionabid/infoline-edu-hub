
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { 
  DashboardData,
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  FormItem,
  DashboardNotification
} from '@/hooks/useDashboardData';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import DashboardTabs from './DashboardTabs';
import { Notification, NotificationType } from '@/types/notification';
import { FormStatus } from '@/types/form';

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

// DashboardNotification-dan Notification-a adaptasiya
const adaptToNotifications = (dashboardNotifications: DashboardNotification[]): Notification[] => {
  return dashboardNotifications?.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    time: notification.time,
    isRead: notification.read || false,
    createdAt: notification.time || new Date().toISOString(),
    userId: '',
    priority: 'normal'
  })) || [];
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
const adaptFormItems = (formItems: FormItem[]) => {
  return formItems?.map(item => ({
    ...item,
    status: item.status as FormStatus // FormStatus tipinə explicit çeviririk
  })) || [];
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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Məlumat yoxdur.</p>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (userRole) {
      case 'superadmin': {
        return <SuperAdminDashboard data={dashboardData} />;
      }
      case 'regionadmin': {
        return <RegionAdminDashboard data={dashboardData} />;
      }
      case 'sectoradmin': {
        return <SectorAdminDashboard data={dashboardData} />;
      }
      case 'schooladmin': {
        return (
          <SchoolAdminDashboard 
            data={dashboardData}
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
