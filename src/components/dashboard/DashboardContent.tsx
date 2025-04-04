
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
  ActivityItem,
  FormItem
} from '@/types/dashboard';
import { FormStatus } from '@/types/form';
import { Notification } from '@/types/notification';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './RegionAdminDashboard';
import SectorAdminDashboard from './SectorAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';

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

// Dashboard utils tipindəki adapter funksiyaları
const adaptFormStatus = (status: string): FormStatus => {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'təsdiqlənib': 
      return 'approved';
    case 'rejected': 
    case 'rədd edilib':
      return 'rejected';
    case 'pending': 
    case 'gözləmədə':
      return 'pending';
    case 'overdue':
    case 'gecikmiş':
      return 'overdue';
    case 'dueSoon':
    case 'due_soon':
    case 'müddəti yaxınlaşır':
      return 'dueSoon';
    default:
      return 'pending';
  }
};

// Form items üçün adapter
const adaptFormItems = (items: any[]): FormItem[] => {
  return items.map(item => ({
    id: item.id || '',
    title: item.title || '',
    status: adaptFormStatus(item.status || 'pending'),
    completionPercentage: item.completionPercentage || item.completion_percentage || 0,
    deadline: item.deadline || null,
    categoryId: item.categoryId || item.category_id || '',
    filledCount: item.filledCount || item.filled_count || 0,
    totalCount: item.totalCount || item.total_count || 0,
  }));
};

// Notification items üçün adapter
const adaptNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(notification => ({
    id: notification.id || '',
    type: notification.type || 'info',
    title: notification.title || '',
    message: notification.message || '',
    priority: notification.priority || 'normal',
    userId: notification.userId || notification.user_id || '',
    createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
    isRead: notification.isRead || notification.is_read || false,
    time: notification.time || formatTimeFromNow(notification.created_at || notification.createdAt),
    relatedEntityId: notification.relatedEntityId || notification.related_entity_id || '',
    relatedEntityType: notification.relatedEntityType || notification.related_entity_type || 'system',
  }));
};

// Activity items üçün adapter
const adaptActivityItems = (items: any[]): ActivityItem[] => {
  return items.map(item => ({
    id: item.id || '',
    type: item.type || 'action',
    title: item.title || '',
    description: item.description || '',
    timestamp: item.timestamp || new Date().toISOString(),
    userId: item.userId || item.user_id || '',
    action: item.action || '',
    actor: item.actor || '',
    target: item.target || '',
    time: item.time || formatTimeFromNow(item.timestamp || item.created_at),
  }));
};

// Tarix formatını şəkilləndirmə funksiyası
const formatTimeFromNow = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000); // millisecond -> minute
  
  if (diffMins < 1) {
    return 'indicə';
  } else if (diffMins < 60) {
    return `${diffMins} dəqiqə əvvəl`;
  } else if (diffMins < 24 * 60) {
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours} saat əvvəl`;
  } else {
    const diffDays = Math.round(diffMins / (60 * 24));
    return `${diffDays} gün əvvəl`;
  }
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

  const navigateToDataEntry = () => {
    navigate('/data-entry');
    toast.success(t('navigatingToDataEntry'), {
      description: t('navigatingToDataEntryDesc')
    });
  };

  const handleFormClick = (formId: string) => {
    navigate(`/data-entry?formId=${formId}`);
    toast.info(t('openingForm'), {
      description: `${t('formId')}: ${formId}`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    console.log('Rendering dashboard for role:', userRole);
    
    try {
      switch (userRole) {
        case 'superadmin': {
          const superAdminData = dashboardData as SuperAdminDashboardData;
          const adaptedNotifications = adaptNotifications(superAdminData.notifications || []);
          
          const adaptedSuperAdminData: SuperAdminDashboardData = {
            ...superAdminData,
            notifications: adaptedNotifications,
            regions: superAdminData.regions || 0,
            sectors: superAdminData.sectors || 0,
            schools: superAdminData.schools || 0,
            users: superAdminData.users || 0,
            completionRate: superAdminData.completionRate || 0,
            pendingApprovals: superAdminData.pendingApprovals || 0,
            pendingSchools: superAdminData.pendingSchools || 0,
            approvedSchools: superAdminData.approvedSchools || 0,
            rejectedSchools: superAdminData.rejectedSchools || 0,
            activityData: adaptActivityItems(superAdminData.activityData || []),
            categoryCompletionData: chartData.categoryCompletionData
          };
          
          return <SuperAdminDashboard data={adaptedSuperAdminData} />;
        }
        case 'regionadmin': {
          const regionAdminData = dashboardData as RegionAdminDashboardData;
          const adaptedNotifications = adaptNotifications(regionAdminData.notifications || []);
          
          const adaptedRegionAdminData: RegionAdminDashboardData = {
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
            activityData: adaptActivityItems(regionAdminData.activityData || []),
            categoryCompletion: regionAdminData.categoryCompletion || chartData.categoryCompletionData,
            statusDistribution: regionAdminData.statusDistribution || []
          };
          
          return <RegionAdminDashboard data={adaptedRegionAdminData} />;
        }
        case 'sectoradmin': {
          const sectorAdminData = dashboardData as SectorAdminDashboardData;
          const adaptedNotifications = adaptNotifications(sectorAdminData.notifications || []);
          
          const adaptedSectorAdminData: SectorAdminDashboardData = {
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
            activityData: adaptActivityItems(sectorAdminData.activityData || [])
          };
          
          return <SectorAdminDashboard data={adaptedSectorAdminData} />;
        }
        case 'schooladmin': 
        default: {
          console.log('Rendering SchoolAdminDashboard (default)');
          const schoolAdminData = dashboardData as SchoolAdminDashboardData;
          const adaptedNotifications = adaptNotifications(schoolAdminData.notifications || []);
          
          const pendingForms = schoolAdminData.pendingForms ? 
            adaptFormItems(schoolAdminData.pendingForms) : [];
          
          let completedForms: FormItem[] = [];
          if (Array.isArray(schoolAdminData.completedForms)) {
            completedForms = adaptFormItems(schoolAdminData.completedForms);
          }
          
          const adaptedSchoolAdminData: SchoolAdminDashboardData = {
            ...schoolAdminData,
            notifications: adaptedNotifications,
            pendingForms: pendingForms,
            completedForms: completedForms,
            forms: schoolAdminData.forms || {
              pending: 0,
              approved: 0,
              rejected: 0,
              dueSoon: 0,
              overdue: 0
            },
            schoolName: schoolAdminData.schoolName || "Unknown School",
            sectorName: schoolAdminData.sectorName || "Unknown Sector",
            regionName: schoolAdminData.regionName || "Unknown Region",
            completionRate: schoolAdminData.completionRate || 0,
            recentForms: schoolAdminData.recentForms ? 
              adaptFormItems(schoolAdminData.recentForms) : [],
            dueSoonForms: schoolAdminData.dueSoonForms ? 
              adaptFormItems(schoolAdminData.dueSoonForms) : [],
            overdueForms: schoolAdminData.overdueForms ? 
              adaptFormItems(schoolAdminData.overdueForms) : [],
            activityData: adaptActivityItems(schoolAdminData.activityData || [])
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
