
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
import { FormStatus } from '@/types/form';
import { Notification, adaptNotification } from '@/types/notification';
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

// İdxal edilən adaptNotifications, adaptFormItems və adaptActivityItems 
// funksiyalarını burada yenidən təyin etmək əvəzinə utils.ts-dən istifadə edəcəyik
import { 
  adaptNotifications, 
  adaptFormItems, 
  adaptActivityItems 
} from '@/hooks/dashboard/utils';

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
          
          let completedForms: FormItem[] | number;
          if (Array.isArray(schoolAdminData.completedForms)) {
            completedForms = adaptFormItems(schoolAdminData.completedForms);
          } else if (typeof schoolAdminData.completedForms === 'number') {
            completedForms = schoolAdminData.completedForms;
          } else {
            completedForms = [];
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
