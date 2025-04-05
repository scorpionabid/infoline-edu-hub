
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { 
  AdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  FormItem
} from '@/types/dashboard';
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
const adaptToNotifications = (dashboardNotifications: any[]): Notification[] => {
  return dashboardNotifications?.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    type: notification.type as NotificationType,
    time: notification.time,
    isRead: notification.read || false,
    createdAt: notification.time || new Date().toISOString(),
    userId: '',
    priority: 'normal'
  })) || [];
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
const adaptFormItems = (formItems: any[]) => {
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

  // Bildirişləri adaptasiya edək
  const adaptDashboardData = (data: any) => {
    if (!data) return data;
    
    // İstifadəçi rolunu daha düzgün müəyyən edək
    // userRole-u string kimi qəbul edirik və lowercase edirik
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    
    // Bildirişləri standart formata çeviririk
    if (data.notifications) {
      data = {
        ...data,
        notifications: adaptToNotifications(data.notifications)
      };
    }
    
    // SchoolAdminDashboard üçün pendingForms məlumatlarını təmin edirik
    if (normalizedRole === 'schooladmin' && data) {
      data = {
        ...data,
        pendingForms: data.pendingForms || []
      };
    }
    
    return data;
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    // İstifadəçi rolunu daha düzgün müəyyən edək
    // userRole-u string kimi qəbul edirik və lowercase edirik
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    
    // Dashboardı göstərməzdən əvvəl dataları adaptasiya edirik
    const adaptedData = adaptDashboardData(dashboardData);

    switch (normalizedRole) {
      case 'superadmin':
        return <SuperAdminDashboard data={adaptedData} />;
      case 'regionadmin':
        return <RegionAdminDashboard data={adaptedData as RegionAdminDashboardData} />;
      case 'sectoradmin':
        return <SectorAdminDashboard data={adaptedData as SectorAdminDashboardData} />;
      case 'schooladmin':
        return (
          <SchoolAdminDashboard 
            data={adaptedData as SchoolAdminDashboardData}
            navigateToDataEntry={navigateToDataEntry}
            handleFormClick={handleFormClick}
          />
        );
      default:
        // Əgər naməlum bir rol gəlirsə, istifadəçinin hansı rolda olduğunu konsola yazaq
        console.warn(`Naməlum istifadəçi rolu: "${userRole}". SchoolAdmin dashboard göstərilir.`);
        return (
          <SchoolAdminDashboard 
            data={adaptedData as SchoolAdminDashboardData}
            navigateToDataEntry={navigateToDataEntry}
            handleFormClick={handleFormClick}
          />
        );
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
