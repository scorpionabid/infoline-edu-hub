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
  FormStatus
} from '@/types/dashboard';
import { Notification } from '@/types/notification';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import NotificationsCard from './NotificationsCard';

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
const adaptNotifications = (notifications: any[]): Notification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('Notifications is not an array:', notifications);
    return [];
  }
  
  return notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt || new Date().toISOString(),
    time: notification.time || notification.createdAt || new Date().toISOString(),
    isRead: notification.isRead || false,
    userId: notification.userId || '',
    priority: notification.priority || 'normal'
  }));
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
const adaptFormItems = (formItems: FormItem[]) => {
  if (!formItems || !Array.isArray(formItems)) {
    console.warn('FormItems is not an array:', formItems);
    return [];
  }
  
  return formItems.map(item => ({
    ...item,
    status: item.status as FormStatus
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

  console.log('DashboardContent rendering for role:', userRole);
  console.log('Dashboard data available:', !!dashboardData);

  // Məlumatlar null və ya undefined olduğunu yoxlayaq
  if (!dashboardData) {
    console.error('Dashboard data is undefined or null');
    return (
      <div className="p-4 border rounded-md">
        <p className="text-center text-muted-foreground">
          {t('dashboardDataNotAvailable')}
        </p>
      </div>
    );
  }

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
    console.log('Rendering dashboard for role:', userRole);
    
    try {
      switch (userRole) {
        case 'superadmin': {
          console.log('Rendering SuperAdminDashboard');
          const superAdminData = dashboardData as SuperAdminDashboardData;
          const adaptedNotifications = adaptNotifications(superAdminData.notifications);
          
          // For SuperAdminDashboard, make sure all required properties are present
          const adaptedSuperAdminData = {
            ...superAdminData,
            notifications: adaptedNotifications
          };
          
          return <SuperAdminDashboard data={adaptedSuperAdminData} />;
        }
        case 'regionadmin': {
          const regionAdminData = dashboardData as RegionAdminDashboardData;
          const adaptedNotifications = adaptNotifications(regionAdminData.notifications);
          
          // For RegionAdminDashboard, make sure all required properties are present
          const adaptedRegionAdminData = {
            ...regionAdminData,
            notifications: adaptedNotifications
          };
          
          return <RegionAdminDashboard data={adaptedRegionAdminData} />;
        }
        case 'sectoradmin': {
          const sectorAdminData = dashboardData as SectorAdminDashboardData;
          const adaptedNotifications = adaptNotifications(sectorAdminData.notifications);
          
          // For SectorAdminDashboard, make sure all required properties are present
          const adaptedSectorAdminData = {
            ...sectorAdminData,
            notifications: adaptedNotifications
          };
          
          return <SectorAdminDashboard data={adaptedSectorAdminData} />;
        }
        case 'schooladmin': 
        default: {
          console.log('Rendering SchoolAdminDashboard (default)');
          const schoolAdminData = dashboardData as SchoolAdminDashboardData;
          const adaptedNotifications = adaptNotifications(schoolAdminData.notifications);
          
          // Forms, pendingForms və recentForms məlumatlarını uyğunlaşdıraq
          const adaptedSchoolAdminData = {
            ...schoolAdminData,
            notifications: adaptedNotifications,
            // Make sure 'forms' property is present
            forms: schoolAdminData.forms || {
              pending: 0,
              approved: 0,
              rejected: 0,
              dueSoon: 0,
              overdue: 0
            },
            // Make sure required properties are present
            schoolName: schoolAdminData.schoolName || "Unknown School",
            sectorName: schoolAdminData.sectorName || "Unknown Sector",
            regionName: schoolAdminData.regionName || "Unknown Region",
            completionRate: schoolAdminData.completionRate || 0,
            // Adapt recentForms if present
            recentForms: schoolAdminData.recentForms || []
          };
          
          return (
            <SchoolAdminDashboard 
              data={adaptedSchoolAdminData}
              navigateToDataEntry={navigateToDataEntry}
              handleFormClick={handleFormClick}
            />
          );
        }
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      return (
        <div className="p-4 border rounded-md">
          <p className="text-center text-muted-foreground">
            {t('dashboardRenderError')}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
