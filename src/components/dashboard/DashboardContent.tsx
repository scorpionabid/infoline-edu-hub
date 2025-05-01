
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './region-admin/RegionAdminDashboard';
import { SectorAdminDashboard } from './sector-admin/SectorAdminDashboard';
import { SchoolAdminDashboard } from './school-admin/SchoolAdminDashboard';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { fetchDashboardData } from '@/api/dashboardApi';

export interface DashboardContentProps {
  // Herhangi bir prop tanımı
}

export const DashboardContent: React.FC<DashboardContentProps> = () => {
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  
  // Rol əsasında dashboard datasını əldə edirik
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['dashboard', userRole, regionId, sectorId, schoolId],
    queryFn: () => fetchDashboardData({ userRole, regionId, sectorId, schoolId })
  });

  // Mock notifications
  const mockNotifications = useMemo(() => [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Təhsil statistikası kateqoriyası sistemə əlavə edildi',
      timestamp: new Date().toISOString(),
      type: 'info' as const,
      read: false
    },
    {
      id: '2',
      title: 'Son müddət xəbərdarlığı',
      message: 'Məktəb məlumatlarını doldurmaq üçün son 3 gün qalıb',
      timestamp: new Date().toISOString(),
      type: 'warning' as const,
      read: false
    }
  ], []);

  // Xəta və ya yüklənmə halları
  if (error) {
    return <div className="p-4 text-center text-red-500">Dashboard məlumatları yüklənərkən xəta baş verdi</div>;
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
    const superAdminData = {
      stats: {
        regions: dashboardData.regions || 0,
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      completionRate: dashboardData.completionRate || 0,
      notifications: mockNotifications
    };

    return <SuperAdminDashboard data={superAdminData} />;
  }

  // RegionAdmin Dashboard
  if (userRole === 'regionadmin') {
    const regionAdminData = {
      stats: {
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      completionRate: dashboardData.completionRate || 0,
      notifications: mockNotifications,
      sectorStats: {
        total: dashboardData.sectors || 0,
        active: dashboardData.activeSectors || 0
      },
      schoolStats: {
        total: dashboardData.schools || 0, 
        active: dashboardData.activeSchools || 0,
        incomplete: dashboardData.incompleteSchools || 0
      }
    };

    return <RegionAdminDashboard data={regionAdminData} />;
  }

  // SectorAdmin Dashboard
  if (userRole === 'sectoradmin') {
    const sectorAdminData = {
      stats: {
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0
      },
      completionRate: dashboardData.completionRate || 0,
      notifications: mockNotifications,
      schoolStats: {
        total: dashboardData.schools || 0,
        active: dashboardData.activeSchools || 0,
        incomplete: dashboardData.incompleteSchools || 0
      }
    };

    return <SectorAdminDashboard data={sectorAdminData} />;
  }

  // SchoolAdmin Dashboard
  if (userRole === 'schooladmin') {
    const schoolAdminData = {
      formStats: {
        total: dashboardData.totalForms || 0,
        approved: dashboardData.approvedForms || 0,
        pending: dashboardData.pendingForms || 0,
        rejected: dashboardData.rejectedForms || 0,
        incomplete: dashboardData.incompleteForms || 0,
        drafts: dashboardData.draftForms || 0
      },
      completionRate: dashboardData.completionRate || 0,
      notifications: mockNotifications
    };

    return <SchoolAdminDashboard data={schoolAdminData} />;
  }

  return <div className="p-4 text-center">Məlumat tapılmadı</div>;
};

export default DashboardContent;
