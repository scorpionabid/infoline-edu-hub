
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
  ActivityItem
} from '@/types/dashboard';
import { FormItem } from '@/types/form';
import { Notification, adaptNotification } from '@/types/notification';
import { FormStatus } from '@/types/form';
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
  
  return notifications.map(notification => adaptNotification(notification));
};

// FormItem-ləri Form formatına çevirmək üçün helper funksiya
const adaptFormItems = (formItems: any[]): FormItem[] => {
  if (!formItems || !Array.isArray(formItems)) {
    console.warn('FormItems is not an array:', formItems);
    return [];
  }
  
  return formItems.map(item => ({
    id: item.id || '',
    title: item.title || '',
    categoryId: item.categoryId || '',
    status: (item.status as FormStatus) || 'draft',
    completionPercentage: item.completionPercentage || 0,
    deadline: item.deadline || '',
    filledCount: item.filledCount || 0,
    totalCount: item.totalCount || 0
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
          const adaptedNotifications = adaptNotifications(superAdminData.notifications || []);
          
          // For SuperAdminDashboard, make sure all required properties are present
          const adaptedSuperAdminData = {
            ...superAdminData,
            notifications: adaptedNotifications,
            // Default dəyərlərin təyin edilməsi
            regions: superAdminData.regions || 0,
            sectors: superAdminData.sectors || 0,
            schools: superAdminData.schools || 0,
            users: superAdminData.users || 0,
            completionRate: superAdminData.completionRate || 0,
            pendingApprovals: superAdminData.pendingApprovals || 0,
            pendingSchools: superAdminData.pendingSchools || 0,
            approvedSchools: superAdminData.approvedSchools || 0,
            rejectedSchools: superAdminData.rejectedSchools || 0,
            // ActivityItem tipini uyğunlaşdıraq
            activityData: (superAdminData.activityData || []).map(item => ({
              id: item.id || '',
              type: item.type || '',
              title: item.title || '',
              description: item.description || '',
              timestamp: item.timestamp || '',
              userId: item.userId || '',
              action: item.action || '',
              actor: item.actor || '',
              target: item.target || '',
              time: item.time || ''
            }))
          };
          
          return <SuperAdminDashboard data={adaptedSuperAdminData} />;
        }
        case 'regionadmin': {
          const regionAdminData = dashboardData as RegionAdminDashboardData;
          const adaptedNotifications = adaptNotifications(regionAdminData.notifications || []);
          
          // For RegionAdminDashboard, make sure all required properties are present
          const adaptedRegionAdminData = {
            ...regionAdminData,
            notifications: adaptedNotifications,
            regionName: regionAdminData.regionName || 'Unknown Region',
            sectors: regionAdminData.sectors || 0,
            schools: regionAdminData.schools || 0,
            approvalRate: regionAdminData.approvalRate || 0,
            completionRate: regionAdminData.completionRate || 0,
            pendingApprovals: regionAdminData.pendingApprovals || 0,
            pendingSchools: regionAdminData.pendingSchools || 0,
            approvedSchools: regionAdminData.approvedSchools || 0,
            rejectedSchools: regionAdminData.rejectedSchools || 0,
            // ActivityItem tipini uyğunlaşdıraq
            activityData: (regionAdminData.activityData || []).map(item => ({
              id: item.id || '',
              type: item.type || '',
              title: item.title || '',
              description: item.description || '',
              timestamp: item.timestamp || '',
              userId: item.userId || '',
              action: item.action || '',
              actor: item.actor || '',
              target: item.target || '',
              time: item.time || ''
            }))
          };
          
          return <RegionAdminDashboard data={adaptedRegionAdminData} />;
        }
        case 'sectoradmin': {
          const sectorAdminData = dashboardData as SectorAdminDashboardData;
          const adaptedNotifications = adaptNotifications(sectorAdminData.notifications || []);
          
          // For SectorAdminDashboard, make sure all required properties are present
          const adaptedSectorAdminData = {
            ...sectorAdminData,
            notifications: adaptedNotifications,
            sectorName: sectorAdminData.sectorName || 'Unknown Sector',
            regionName: sectorAdminData.regionName || 'Unknown Region',
            schools: sectorAdminData.schools || 0,
            pendingApprovals: sectorAdminData.pendingApprovals || 0,
            completionRate: sectorAdminData.completionRate || 0,
            pendingSchools: sectorAdminData.pendingSchools || 0,
            approvedSchools: sectorAdminData.approvedSchools || 0,
            rejectedSchools: sectorAdminData.rejectedSchools || 0,
            // ActivityItem tipini uyğunlaşdıraq
            activityData: (sectorAdminData.activityData || []).map(item => ({
              id: item.id || '',
              type: item.type || '',
              title: item.title || '',
              description: item.description || '',
              timestamp: item.timestamp || '',
              userId: item.userId || '', 
              action: item.action || '',
              actor: item.actor || '',
              target: item.target || '',
              time: item.time || ''
            }))
          };
          
          return <SectorAdminDashboard data={adaptedSectorAdminData} />;
        }
        case 'schooladmin': 
        default: {
          console.log('Rendering SchoolAdminDashboard (default)');
          const schoolAdminData = dashboardData as SchoolAdminDashboardData;
          const adaptedNotifications = adaptNotifications(schoolAdminData.notifications || []);
          
          // Ensure pendingForms exists and is properly formatted
          const pendingForms = schoolAdminData.pendingForms ? 
            adaptFormItems(schoolAdminData.pendingForms) : [];
          
          // Ensure completedForms is correctly formatted - could be FormItem[] or number
          let completedForms: FormItem[];
          if (Array.isArray(schoolAdminData.completedForms)) {
            completedForms = adaptFormItems(schoolAdminData.completedForms);
          } else {
            // If it's a number, convert it to an empty array - we'll handle this in the component
            completedForms = [];
          }
          
          // Forms, pendingForms və recentForms məlumatlarını uyğunlaşdıraq
          const adaptedSchoolAdminData: SchoolAdminDashboardData = {
            ...schoolAdminData,
            notifications: adaptedNotifications,
            pendingForms: pendingForms,
            completedForms: completedForms,
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
            recentForms: schoolAdminData.recentForms ? 
              adaptFormItems(schoolAdminData.recentForms) : [],
            // Adapt dueSoonForms if present
            dueSoonForms: schoolAdminData.dueSoonForms ? 
              adaptFormItems(schoolAdminData.dueSoonForms) : [],
            // Adapt overdueForms if present
            overdueForms: schoolAdminData.overdueForms ? 
              adaptFormItems(schoolAdminData.overdueForms) : [],
            // ActivityItem tipini uyğunlaşdıraq
            activityData: (schoolAdminData.activityData || []).map(item => ({
              id: item.id || '',
              type: item.type || '',
              title: item.title || '',
              description: item.description || '',
              timestamp: item.timestamp || '',
              userId: item.userId || '',
              action: item.action || '',
              actor: item.actor || '',
              target: item.target || '',
              time: item.time || ''
            }))
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
