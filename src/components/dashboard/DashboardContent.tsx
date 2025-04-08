
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
const adaptToNotifications = (dashboardNotifications: any[] | null | undefined): Notification[] => {
  if (!dashboardNotifications || !Array.isArray(dashboardNotifications)) {
    return [];
  }
  
  return dashboardNotifications.map(notification => ({
    id: notification.id || `notification-${Math.random().toString(36).substring(2, 11)}`,
    title: notification.title || '',
    message: notification.message || '',
    type: (notification.type as NotificationType) || 'info',
    time: notification.time || new Date().toISOString(),
    isRead: notification.read || false,
    createdAt: notification.time || new Date().toISOString(),
    userId: notification.userId || '',
    priority: notification.priority || 'normal'
  }));
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
const adaptFormItems = (formItems: any[] | null | undefined) => {
  if (!formItems || !Array.isArray(formItems)) {
    return [];
  }
  
  return formItems.map(item => ({
    ...item,
    id: item.id || `form-${Math.random().toString(36).substring(2, 11)}`,
    title: item.title || '',
    date: item.date || new Date().toISOString(),
    status: (item.status as FormStatus) || 'pending'
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

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Məlumat yoxdur.</p>
      </div>
    );
  }

  // Bildirişləri adaptasiya edək
  const adaptDashboardData = (data: any) => {
    if (!data) {
      // Əgər data null və ya undefined-dırsa, boş bir obyekt qaytarırıq
      return {
        regions: 0,
        sectors: 0,
        schools: 0,
        users: 0,
        completionRate: 0,
        pendingApprovals: 0,
        notifications: [],
        pendingForms: []
      };
    }
    
    // İstifadəçi rolunu daha düzgün müəyyən edək
    // userRole-u string kimi qəbul edirik və lowercase edirik
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    
    // Bildirişləri standart formata çeviririk
    if (data.notifications) {
      data = {
        ...data,
        notifications: adaptToNotifications(data.notifications)
      };
    } else {
      data.notifications = [];
    }
    
    // SchoolAdminDashboard üçün pendingForms məlumatlarını təmin edirik
    if (normalizedRole === 'schooladmin') {
      data = {
        ...data,
        pendingForms: data.pendingForms ? adaptFormItems(data.pendingForms) : []
      };
    }
    
    // Chart dataları üçün əlavə yoxlamalar
    if (chartData) {
      // Əmin olaq ki, bütün chart data massivləri düzgün formatdadır
      if (!Array.isArray(chartData.activityData)) {
        chartData.activityData = [];
      }
      
      if (!Array.isArray(chartData.regionSchoolsData)) {
        chartData.regionSchoolsData = [];
      }
      
      if (!Array.isArray(chartData.categoryCompletionData)) {
        chartData.categoryCompletionData = [];
      }
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

    try {
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

  // Chart data null yoxlaması əlavə edək
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
