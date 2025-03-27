
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
  FormItem
} from '@/hooks/dashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import DashboardTabs from './DashboardTabs';
import { Notification as DashboardNotification } from './NotificationsCard';
import { Notification } from '@/types/notification';
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

// Notification formatını uyğunlaşdırma funksiyası
const adaptNotifications = (notifications: Notification[]): DashboardNotification[] => {
  if (!notifications || !Array.isArray(notifications)) {
    console.warn('Notifications is not an array:', notifications);
    return [];
  }
  
  return notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: notification.createdAt // createdAt'ı time'a çeviririk
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
        const adaptedNotifications = adaptNotifications(superAdminData?.notifications || []);
        const preparedData = {
          ...superAdminData,
          notifications: adaptedNotifications
        };
        return <SuperAdminDashboard data={preparedData} />;
      }
      case 'regionadmin': {
        const regionAdminData = dashboardData as RegionAdminDashboardData;
        const adaptedNotifications = adaptNotifications(regionAdminData?.notifications || []);
        const preparedData = {
          ...regionAdminData,
          notifications: adaptedNotifications,
          categories: regionAdminData?.categories || [],
          sectorCompletions: regionAdminData?.sectorCompletions || []
        };
        return <RegionAdminDashboard data={preparedData} />;
      }
      case 'sectoradmin': {
        const sectorAdminData = dashboardData as SectorAdminDashboardData;
        const adaptedNotifications = adaptNotifications(sectorAdminData?.notifications || []);
        const preparedData = {
          ...sectorAdminData,
          notifications: adaptedNotifications
        };
        return <SectorAdminDashboard data={preparedData} />;
      }
      case 'schooladmin': {
        // Əmin olaq ki, dashboardData mövcuddur
        if (!dashboardData) {
          console.error('School admin dashboard data is undefined');
          // SchoolAdminDashboard props tipi ilə uyğun bir veri strukturu təqdim edək
          const emptySchoolData: SchoolAdminDashboardData = {
            schoolName: '',
            sectorName: '',
            regionName: '',
            totalSchools: 0,
            activeSchools: 0,
            pendingForms: [],
            upcomingDeadlines: [],
            regionalStats: [],
            sectorStats: [],
            forms: {
              pending: 0,
              approved: 0,
              rejected: 0,
              dueSoon: 0,
              overdue: 0
            },
            completionRate: 0,
            notifications: []
          };
          
          const adaptedNotifications = adaptNotifications(emptySchoolData.notifications);
          
          return (
            <SchoolAdminDashboard 
              data={{
                ...emptySchoolData,
                notifications: adaptedNotifications
              }}
              navigateToDataEntry={navigateToDataEntry}
              handleFormClick={handleFormClick}
            />
          );
        }
        
        const schoolAdminData = dashboardData as SchoolAdminDashboardData;
        const adaptedNotifications = adaptNotifications(schoolAdminData?.notifications || []);
        
        // Əmin olaq ki, pendingForms məlumatı düzgün formadadır
        const pendingFormsData = Array.isArray(schoolAdminData?.pendingForms) 
          ? schoolAdminData.pendingForms 
          : [];

        // recentForms-ları da uyğunlaşdırırıq
        const recentFormsData = Array.isArray(schoolAdminData?.recentForms) 
          ? adaptFormItems(schoolAdminData.recentForms)
          : [];
        
        // Əmin olaq ki, forms obyekti mövcuddur
        const forms = schoolAdminData?.forms || {
          pending: 0,
          approved: 0,
          rejected: 0,
          dueSoon: 0,
          overdue: 0
        };
        
        const preparedData = {
          ...schoolAdminData,
          schoolName: schoolAdminData?.schoolName || '',
          sectorName: schoolAdminData?.sectorName || '',
          regionName: schoolAdminData?.regionName || '',
          notifications: adaptedNotifications,
          pendingForms: pendingFormsData,
          recentForms: recentFormsData,
          forms: forms
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
        console.error('Unknown user role:', userRole);
        return (
          <div className="p-4 border rounded-md">
            <p className="text-center text-muted-foreground">
              {t('unknownUserRole')}
            </p>
          </div>
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
