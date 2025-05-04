
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

// Düzgün tip konversiyaları
import { 
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
} from '@/types/dashboard';

// Notification tipi
interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: "deadline" | "approval" | "rejection" | "comment" | "system";
  read: boolean;
}

// Bildiriş məlumatlarını konvertasiya edən yardımçı funksiya
const convertToDashboardNotification = (notification: Notification) => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  date: notification.createdAt,
  type: notification.type,
  isRead: !notification.read
});

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
    queryFn: () => fetchDashboardData({ userRole, regionId, sectorId, schoolId }),
    staleTime: 30000, // 30 saniyə cache
    retry: 1, // Xəta halında maksimum 1 dəfə cəhd et
    refetchOnWindowFocus: false // Focus dəyişəndə yenidən məlumat almırıq
  });

  // Mock notifications
  const mockNotifications = useMemo(() => [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Təhsil statistikası kateqoriyası sistemə əlavə edildi',
      createdAt: new Date().toISOString(),
      type: 'system' as const,
      read: false
    },
    {
      id: '2',
      title: 'Son müddət xəbərdarlığı',
      message: 'Məktəb məlumatlarını doldurmaq üçün son 3 gün qalıb',
      createdAt: new Date().toISOString(),
      type: 'deadline' as const,
      read: false
    }
  ], []);

  // Xəta və ya yüklənmə halları
  if (error) {
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
    const formsByStatus = {
      pending: dashboardData.pendingForms || 0,
      approved: dashboardData.approvedForms || 0,
      rejected: dashboardData.rejectedForms || 0,
      total: dashboardData.totalForms || 0
    };

    const superAdminData: SuperAdminDashboardData = {
      stats: {
        regions: dashboardData.regions || 0,
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      // Bildirişlər üçün uyğun konversiya edirik
      notifications: mockNotifications.map(convertToDashboardNotification),
      formsByStatus,
      completionRate: dashboardData.completionRate || 0,
      approvalRate: dashboardData.approvalRate || 0
    };

    return <SuperAdminDashboard data={superAdminData} />;
  }

  // RegionAdmin Dashboard
  if (userRole === 'regionadmin') {
    const sectorStats = {
      total: dashboardData.sectors || 0,
      active: dashboardData.activeSectors || 0
    };

    const schoolStats = {
      total: dashboardData.schools || 0, 
      active: dashboardData.activeSchools || 0,
      incomplete: dashboardData.incompleteSchools || 0
    };

    const regionAdminData: RegionAdminDashboardData = {
      stats: {
        sectors: dashboardData.sectors || 0,
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0,
      },
      notifications: mockNotifications.map(convertToDashboardNotification),
      sectorStats,
      schoolStats,
      completionRate: dashboardData.completionRate || 0
    };

    return <RegionAdminDashboard data={regionAdminData} />;
  }

  // SectorAdmin Dashboard
  if (userRole === 'sectoradmin') {
    const schoolsStats = [{
      total: dashboardData.schools || 0,
      incomplete: dashboardData.incompleteSchools || 0,
      active: dashboardData.activeSchools || 0
    }];
    
    const sectorAdminData: SectorAdminDashboardData = {
      stats: {
        schools: dashboardData.schools || 0,
        users: dashboardData.users || 0
      },
      schoolsStats,
      notifications: mockNotifications.map(convertToDashboardNotification),
      completionRate: dashboardData.completionRate || 0
    };

    return <SectorAdminDashboard data={sectorAdminData} />;
  }

  // SchoolAdmin Dashboard
  if (userRole === 'schooladmin') {
    const formStats = {
      total: dashboardData.totalForms || 0,
      approved: dashboardData.approvedForms || 0,
      pending: dashboardData.pendingForms || 0,
      rejected: dashboardData.rejectedForms || 0,
      incomplete: dashboardData.incompleteForms || 0,
      drafts: dashboardData.draftForms || 0
    };

    const schoolAdminData: SchoolAdminDashboardData = {
      formStats,
      notifications: mockNotifications.map(convertToDashboardNotification),
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

export default DashboardContent;
