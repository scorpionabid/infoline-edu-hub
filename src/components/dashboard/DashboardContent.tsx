
// Əvvəlcədən SectorAdminDashboard-da olan SchoolStatsCard komponentini düzəldək
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import { 
  CompletionData,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardStatus
} from '@/types/dashboard';

const DashboardContent = () => {
  const { user, loading } = useAuth();
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  
  // Mockdatas hazırlayaq (bunu daha sonra API ilə əvəz edirik)
  const [superAdminData, setSuperAdminData] = useState<SuperAdminDashboardData>({
    completion: {
      percentage: 78,
      total: 1200,
      completed: 936,
    },
    status: {
      pending: 156,
      approved: 936,
      rejected: 48,
      draft: 60,
      total: 1200,
      active: 25,
      inactive: 5
    },
    formStats: {
      pending: 156,
      approved: 936,
      rejected: 48,
      draft: 60,
      total: 1200,
      dueSoon: 24,
      overdue: 12
    },
    schoolStats: [],
    regionStats: [],
    sectorStats: [],
    upcomingDeadlines: [],
    notifications: [
      {
        id: '1',
        title: 'Yeni region əlavə edildi',
        message: 'Bakı regionu sistemə əlavə edildi.',
        date: '2023-11-01T09:00:00Z',
        isRead: false,
        type: 'info',
      },
      {
        id: '2',
        title: 'Məktəb statistikası yeniləndi',
        message: '10 məktəb üçün statistika yeniləndi.',
        date: '2023-11-01T07:30:00Z',
        isRead: true,
        type: 'success',
      },
    ]
  });

  const [regionAdminData, setRegionAdminData] = useState<RegionAdminDashboardData>({
    completion: {
      percentage: 72,
      total: 600,
      completed: 432,
    },
    status: {
      pending: 96,
      approved: 432,
      rejected: 36,
      draft: 36,
      total: 600,
      active: 15,
      inactive: 3
    },
    sectors: [],
    schoolStats: [],
    formStats: {
      pending: 96,
      approved: 432,
      rejected: 36,
      draft: 36,
      total: 600,
      dueSoon: 12,
      overdue: 8
    },
    notifications: [
      {
        id: '1',
        title: 'Yeni sektor əlavə edildi',
        message: 'Bakı Binəqədi sektoru sistemə əlavə edildi.',
        date: '2023-11-01T10:30:00Z',
        isRead: false,
        type: 'info',
      }
    ]
  });

  const [sectorAdminData, setSectorAdminData] = useState<SectorAdminDashboardData>({
    completion: {
      percentage: 68,
      total: 200,
      completed: 136,
    },
    status: {
      pending: 40,
      approved: 136,
      rejected: 12,
      draft: 12,
      total: 200,
      active: 8,
      inactive: 2
    },
    schoolStats: [],
    formStats: {
      pending: 40,
      approved: 136,
      rejected: 12,
      draft: 12,
      total: 200,
      dueSoon: 6,
      overdue: 4
    },
    pendingApprovals: [
      {
        id: '1',
        schoolId: '101',
        schoolName: '20 nömrəli məktəb',
        categoryId: '201',
        categoryName: 'Aylıq hesabat',
        status: 'pending',
        submittedAt: '2023-11-01T11:00:00Z'
      },
      {
        id: '2',
        schoolId: '102',
        schoolName: '28 nömrəli məktəb',
        categoryId: '202',
        categoryName: 'Rüblük statistika',
        status: 'pending',
        submittedAt: '2023-11-01T10:45:00Z'
      }
    ],
    notifications: [
      {
        id: '1',
        title: 'Təcili diqqət',
        message: '3 məktəb formu son tarixə çatdırmadı.',
        date: '2023-11-01T09:15:00Z',
        isRead: false,
        type: 'warning',
      }
    ]
  });

  const [schoolAdminData, setSchoolAdminData] = useState<SchoolAdminDashboardData>({
    completion: {
      percentage: 85,
      total: 40,
      completed: 34,
    },
    status: {
      pending: 3,
      approved: 34,
      rejected: 1,
      draft: 2,
      total: 40,
      active: 5,
      inactive: 0
    },
    formStats: {
      pending: 3,
      approved: 34,
      rejected: 1,
      draft: 2,
      total: 40,
      dueSoon: 2,
      overdue: 1
    },
    categories: [
      {
        id: '201',
        name: 'Aylıq hesabat',
        description: 'Hər ay təqdim edilməli olan hesabat',
        deadline: '2023-11-15T23:59:59Z',
      },
      {
        id: '202',
        name: 'Rüblük statistika',
        description: 'Rüb ərzində toplanmış statistika',
        deadline: '2023-12-31T23:59:59Z',
      }
    ],
    upcoming: [
      {
        id: '301',
        category: 'Aylıq hesabat',
        categoryId: '201',
        categoryName: 'Aylıq hesabat',
        dueDate: '2023-11-15T23:59:59Z',
        status: 'pending',
        completionRate: 30
      },
      {
        id: '302',
        category: 'Rüblük statistika',
        categoryId: '202',
        categoryName: 'Rüblük statistika',
        dueDate: '2023-12-31T23:59:59Z',
        status: 'draft',
        completionRate: 15
      }
    ],
    pendingForms: [
      {
        id: '401',
        category: 'Aylıq hesabat',
        categoryId: '201',
        categoryName: 'Aylıq hesabat',
        status: 'pending',
        completionRate: 100,
        submittedAt: '2023-10-31T16:45:00Z'
      }
    ],
    completionRate: 85,
    notifications: [
      {
        id: '1',
        title: 'Təsdiq edildi',
        message: 'Aylıq hesabatınız təsdiqləndi.',
        date: '2023-10-30T14:00:00Z',
        isRead: true,
        type: 'success',
      },
      {
        id: '2',
        title: 'Son tarix yaxınlaşır',
        message: 'Rüblük statistika son tarixi 2 həftədən az qalıb.',
        date: '2023-10-31T09:00:00Z',
        isRead: false,
        type: 'warning',
      }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          İstifadəçi giriş etməlidir
        </p>
      </div>
    );
  }

  return (
    <div>
      {userRole === 'superadmin' && (
        <SuperAdminDashboard data={superAdminData} />
      )}

      {userRole === 'regionadmin' && (
        <RegionAdminDashboard 
          data={regionAdminData} 
          regionId={regionId} 
        />
      )}

      {userRole === 'sectoradmin' && (
        <SectorAdminDashboard 
          data={sectorAdminData} 
          sectorId={sectorId} 
        />
      )}

      {userRole === 'schooladmin' && (
        <SchoolAdminDashboard 
          data={schoolAdminData} 
          schoolId={schoolId} 
        />
      )}
    </div>
  );
};

export default DashboardContent;
