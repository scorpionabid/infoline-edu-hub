
import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './region-admin/RegionAdminDashboard';
import { SectorAdminDashboard } from './sector-admin/SectorAdminDashboard';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { fetchDashboardData } from '@/api/dashboardApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { 
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardNotification,
  SchoolStat
} from '@/types/dashboard';

export interface DashboardContentProps {
  // Hər hansı bir prop tanımı
}

export const DashboardContent: React.FC<DashboardContentProps> = () => {
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const navigate = useNavigate();
  
  // Məlumat daxil etmə səhifəsinə keçid funksiyası
  const navigateToDataEntry = useCallback(() => {
    navigate('/data-entry');
  }, [navigate]);
  
  // Form elementinə klik funksiyası
  const handleFormClick = useCallback((formId: string) => {
    navigate(`/data-entry?categoryId=${formId}`);
  }, [navigate]);
  
  // Rol əsasında dashboard datasını əldə edirik
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard', userRole, regionId, sectorId, schoolId],
    queryFn: () => fetchDashboardData({ userRole, regionId, sectorId, schoolId })
  });

  // Mock notifications
  const mockNotifications = useMemo<DashboardNotification[]>(() => [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Təhsil statistikası kateqoriyası sistemə əlavə edildi',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      type: 'system', // "error" | "info" | "warning" | "success" tiplərinə uyğunlaşdıraq
      isRead: false,
      read: false
    },
    {
      id: '2',
      title: 'Son müddət xəbərdarlığı',
      message: 'Məktəb məlumatlarını doldurmaq üçün son 3 gün qalıb',
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
      type: 'deadline', // "error" | "info" | "warning" | "success" tiplərinə uyğunlaşdıraq
      isRead: false,
      read: false
    }
  ], []);

  // Xəta və ya yüklənmə halları
  if (error) {
    toast.error('Məlumatları yükləyərkən xəta baş verdi');
    console.error('Dashboard data yüklənmə xətası:', error);
    
    return (
      <div className="p-4 text-center text-red-500">Dashboard məlumatları yüklənərkən xəta baş verdi</div>
    );
  }

  // Dashboard datası əldə edilənə qədər yüklənmə göstəririk
  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // SuperAdmin Dashboard
  if (userRole === 'superadmin') {
    const superAdminData: SuperAdminDashboardData = {
      stats: {
        regions: dashboardData.regions || 0,
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      regions: [],
      pendingApprovals: [],
      regionCount: dashboardData.regions || 0,
      sectorCount: dashboardData.sectors || 0,
      schoolCount: dashboardData.schools || 0,
      userCount: dashboardData.users || 0,
      formsByStatus: {
        pending: dashboardData.pendingForms || 0,
        approved: dashboardData.approvedForms || 0,
        rejected: dashboardData.rejectedForms || 0,
        total: dashboardData.totalForms || 0
      },
      notifications: mockNotifications.map(notification => ({
        ...notification,
        type: mapNotificationTypeToUIType(notification.type)
      })),
      approvalRate: dashboardData.approvalRate || 0
    };

    return <SuperAdminDashboard data={superAdminData} />;
  }

  // RegionAdmin Dashboard
  if (userRole === 'regionadmin') {
    const regionAdminData: RegionAdminDashboardData = {
      stats: {
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      pendingItems: [],
      categories: [],
      sectors: [],
      notifications: mockNotifications.map(notification => ({
        ...notification,
        type: mapNotificationTypeToUIType(notification.type)
      })),
      sectorStats: {
        total: dashboardData.sectors || 0,
        active: dashboardData.activeSectors || 0
      },
      schoolStats: {
        total: dashboardData.schools || 0, 
        active: dashboardData.activeSchools || 0,
        incomplete: dashboardData.incompleteSchools || 0
      },
      completionRate: dashboardData.completionRate || 0
    };

    return <RegionAdminDashboard data={regionAdminData} />;
  }

  // SectorAdmin Dashboard
  if (userRole === 'sectoradmin') {
    const schoolsStatItem: SchoolStat = {
      total: dashboardData.schools || 0,
      incomplete: dashboardData.incompleteSchools || 0
    };
    
    const sectorAdminData: SectorAdminDashboardData = {
      stats: {
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0
      },
      pendingItems: [],
      schools: [],
      categories: [],
      schoolsStats: [schoolsStatItem],
      notifications: mockNotifications.map(notification => ({
        ...notification,
        type: mapNotificationTypeToUIType(notification.type)
      })),
      completionRate: dashboardData.completionRate || 0
    };

    return <SectorAdminDashboard data={sectorAdminData} />;
  }

  // SchoolAdmin Dashboard
  if (userRole === 'schooladmin') {
    const schoolAdminData: SchoolAdminDashboardData = {
      formStats: {
        total: dashboardData.totalForms || 0,
        approved: dashboardData.approvedForms || 0,
        pending: dashboardData.pendingForms || 0,
        rejected: dashboardData.rejectedForms || 0,
        incomplete: dashboardData.incompleteForms || 0,
        drafts: dashboardData.draftForms || 0
      },
      notifications: mockNotifications.map(notification => ({
        ...notification,
        type: mapNotificationTypeToUIType(notification.type)
      })),
      categories: dashboardData.categories || [],
      completionRate: dashboardData.completionRate || 0
    };

    return (
      <SchoolAdminDashboard 
        data={schoolAdminData}
        isLoading={isLoading}
        error={error}
        onRefresh={refetch}
        navigateToDataEntry={navigateToDataEntry}
        handleFormClick={handleFormClick}
      />
    );
  }

  return <div className="p-4 text-center">Məlumat tapılmadı</div>;
};

// Notification tiplərini UI tiplərinə çevirmək üçün funksiya
function mapNotificationTypeToUIType(type: string): "error" | "info" | "warning" | "success" {
  switch (type) {
    case 'system':
      return 'info';
    case 'deadline':
      return 'warning';
    case 'approval':
      return 'success';
    case 'rejection':
      return 'error';
    case 'comment':
      return 'info';
    default:
      return 'info';
  }
}

export default DashboardContent;
