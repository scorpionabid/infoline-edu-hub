
import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import { 
  DashboardStats, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  SuperAdminDashboardData,
  CompletionData,
  DashboardStatus
} from '@/types/dashboard';

const DashboardContent: React.FC = () => {
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const { t } = useLanguage();
  const [superAdminData, setSuperAdminData] = useState<SuperAdminDashboardData>({
    stats: {
      regions: 0,
      sectors: 0,
      schools: 0,
      users: 0
    },
    formsByStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0
    },
    completionRate: 0,
    notifications: [],
  });
  
  const [regionAdminData, setRegionAdminData] = useState<RegionAdminDashboardData>({
    completion: {
      percentage: 0,
      total: 0,
      completed: 0
    },
    status: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0
    },
    categories: [],
    sectors: [],
    notifications: [],
    pendingApprovals: []
  });
  
  const [sectorAdminData, setSectorAdminData] = useState<SectorAdminDashboardData>({
    schoolStats: [],
    completion: {
      percentage: 0,
      total: 0,
      completed: 0
    },
    status: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0
    },
    pendingApprovals: [],
    notifications: []
  });
  
  const [schoolAdminData, setSchoolAdminData] = useState<SchoolAdminDashboardData>({
    completion: {
      percentage: 0,
      total: 0,
      completed: 0
    },
    status: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0
    },
    categories: [],
    upcoming: [],
    formStats: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0,
      incomplete: 0,
      dueSoon: 0,
      overdue: 0
    },
    pendingForms: [],
    completionRate: 0,
    notifications: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data və ya API'dən məlumatları yükləmək üçün
  useEffect(() => {
    // Əsl sistemdə burada API sorğusu olacaq
    setTimeout(() => {
      // SuperAdmin məlumatlarını təyin edirik
      setSuperAdminData({
        stats: {
          regions: 14,
          sectors: 78,
          schools: 450,
          users: 120
        },
        formsByStatus: {
          pending: 85,
          approved: 347,
          rejected: 42,
          total: 500
        },
        completionRate: 75,
        notifications: [],
      });
      
      // RegionAdmin məlumatlarını təyin edirik
      setRegionAdminData({
        completion: {
          percentage: 65,
          total: 100,
          completed: 65
        },
        status: {
          pending: 12,
          approved: 73,
          rejected: 8,
          draft: 7,
          total: 100
        },
        categories: [],
        sectors: [
          { id: '1', name: 'Bakı şəhəri', completionRate: 75, schoolCount: 150 },
          { id: '2', name: 'Sumqayıt şəhəri', completionRate: 62, schoolCount: 75 },
          { id: '3', name: 'Gəncə şəhəri', completionRate: 48, schoolCount: 52 }
        ],
        notifications: [],
        pendingApprovals: []
      });
      
      // SectorAdmin məlumatlarını təyin edirik
      setSectorAdminData({
        schoolStats: [],
        completion: {
          percentage: 58,
          total: 50,
          completed: 29
        },
        status: {
          pending: 5,
          approved: 42,
          rejected: 3,
          draft: 0,
          total: 50
        },
        pendingApprovals: [],
        notifications: []
      });
      
      // SchoolAdmin məlumatlarını təyin edirik
      setSchoolAdminData({
        completion: {
          percentage: 80,
          total: 10,
          completed: 8
        },
        status: {
          pending: 1,
          approved: 8,
          rejected: 0,
          draft: 1,
          total: 10
        },
        categories: [],
        upcoming: [],
        formStats: {
          pending: 1,
          approved: 8,
          rejected: 0,
          draft: 1,
          total: 10,
          incomplete: 2,
          dueSoon: 1,
          overdue: 0
        },
        pendingForms: [],
        completionRate: 80,
        notifications: []
      });
      
      setIsLoading(false);
    }, 500);
  }, []);

  // Rol əsaslı dashboard göstərmə
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard data={superAdminData} />;
    
    case 'regionadmin':
      return <RegionAdminDashboard data={regionAdminData} regionId={regionId} />;
    
    case 'sectoradmin':
      return <SectorAdminDashboard data={sectorAdminData} />;
    
    case 'schooladmin':
      return <SchoolAdminDashboard data={schoolAdminData} schoolId={schoolId} />;
    
    default:
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {t('noDataAvailableForRole')}
        </div>
      );
  }
};

export default DashboardContent;
