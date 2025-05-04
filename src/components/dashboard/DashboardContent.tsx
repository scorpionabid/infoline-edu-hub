
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useLanguage } from '@/context/LanguageContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import { 
  DashboardData, 
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  Notification
} from '@/types/dashboard.d';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dashboard məlumatlarını yükləyirik
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.role) {
        console.error('İstifadəçi və ya rol məlumatları mövcud deyil');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        let data: any = {};
        
        // İstifadəçinin roluna uyğun dashboard məlumatlarını yükləyirik
        switch (user.role) {
          case 'superadmin':
            data = await fetchSuperAdminData();
            break;
          case 'regionadmin':
            data = await fetchRegionAdminData(user.id);
            break;
          case 'sectoradmin':
            data = await fetchSectorAdminData(user.id);
            break;
          case 'schooladmin':
            data = await fetchSchoolAdminData(user.id);
            break;
          default:
            throw new Error('Naməlum istifadəçi rolu');
        }
        
        console.log(`${user.role} dashboard məlumatları yükləndi:`, data);
        setDashboardData(data);
      } catch (error: any) {
        console.error('Dashboard məlumatlarını yükləyərkən xəta baş verdi:', error);
        setError(error.message || 'Dashboard məlumatlarını yükləyərkən xəta baş verdi');
        toast.error(t('errorLoadingDashboard'), {
          description: error.message || t('unexpectedError')
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

  // SuperAdmin Dashboard məlumatlarını əldə etmək
  const fetchSuperAdminData = async (): Promise<SuperAdminDashboardData> => {
    // İmitasiya edilmiş məlumatlar (daha sonra real API endpoint istifadə ediləcək)
    const mockData: SuperAdminDashboardData = {
      regions: [
        { id: '1', name: 'Bakı', totalSchools: 150, completionRate: 85, sectorCount: 5, schoolCount: 150 },
        { id: '2', name: 'Sumqayıt', totalSchools: 75, completionRate: 72, sectorCount: 3, schoolCount: 75 },
      ],
      stats: {
        regions: 10,
        sectors: 25,
        schools: 450,
        users: 1200
      },
      totalSchools: 450,
      totalUsers: 1200,
      summary: {
        totalForms: 850,
        completedForms: 720,
        pendingForms: 80,
        overdueForms: 50,
        completionRate: 85
      },
      recentActivity: [
        { id: '1', type: 'form_submitted', title: 'Form təqdim edildi', description: 'Bakı, Məktəb #45', timestamp: new Date().toISOString(), user: 'Admin' }
      ],
      notifications: [
        { 
          id: '1', 
          title: 'Yeni bildiriş', 
          message: 'Növbəti toplantı sabah saat 10:00-da keçiriləcək', 
          type: 'info',
          isRead: false,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      formsByStatus: {
        pending: 80,
        approved: 720,
        rejected: 50,
        total: 850
      },
      approvalRate: 85,
      completionRate: 85
    };
    
    return mockData;
  };

  // RegionAdmin Dashboard məlumatlarını əldə etmək
  const fetchRegionAdminData = async (userId: string): Promise<RegionAdminDashboardData> => {
    // İmitasiya edilmiş məlumatlar (daha sonra real API endpoint istifadə ediləcək)
    const mockData: RegionAdminDashboardData = {
      sectors: [
        { id: '1', name: 'Yasamal', regionId: 'r1', regionName: 'Bakı', totalSchools: 45, completionRate: 92 },
        { id: '2', name: 'Nizami', regionId: 'r1', regionName: 'Bakı', totalSchools: 38, completionRate: 78 }
      ],
      stats: {
        sectors: 8,
        schools: 120,
        users: 350
      },
      totalSchools: 120,
      summary: {
        totalForms: 350,
        completedForms: 280,
        pendingForms: 40,
        overdueForms: 30,
        completionRate: 80
      },
      recentActivity: [
        { id: '1', type: 'form_approved', title: 'Form təsdiqləndi', description: 'Yasamal, Məktəb #12', timestamp: new Date().toISOString(), user: 'Region Admin' }
      ],
      notifications: [
        { 
          id: '1', 
          title: 'Yeni bildiriş', 
          message: 'Yeni sektor əlavə edildi', 
          type: 'success',
          isRead: false,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      sectorStats: {
        total: 8,
        active: 7
      },
      schoolStats: {
        total: 120,
        active: 115,
        incomplete: 20
      },
      approvalRate: 82,
      completionRate: 80
    };
    
    return mockData;
  };

  // SectorAdmin Dashboard məlumatlarını əldə etmək
  const fetchSectorAdminData = async (userId: string): Promise<SectorAdminDashboardData> => {
    // İmitasiya edilmiş məlumatlar (daha sonra real API endpoint istifadə ediləcək)
    const mockData: SectorAdminDashboardData = {
      schools: [
        { id: '1', name: 'Məktəb #45', sectorId: 's1', sectorName: 'Yasamal', regionId: 'r1', regionName: 'Bakı', completedForms: 35, totalForms: 40, completionRate: 87.5 },
        { id: '2', name: 'Məktəb #28', sectorId: 's1', sectorName: 'Yasamal', regionId: 'r1', regionName: 'Bakı', completedForms: 28, totalForms: 40, completionRate: 70 }
      ],
      stats: {
        schools: 45,
        users: 150
      },
      summary: {
        totalForms: 180,
        completedForms: 140,
        pendingForms: 25,
        overdueForms: 15,
        completionRate: 78
      },
      recentActivity: [
        { id: '1', type: 'form_submitted', title: 'Form təqdim edildi', description: 'Məktəb #28', timestamp: new Date().toISOString(), user: 'Məktəb Admin' }
      ],
      notifications: [
        { 
          id: '1', 
          title: 'Təcili bildiriş', 
          message: 'Məktəb #22 formu gecikdirir', 
          type: 'warning',
          isRead: false,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      schoolsStats: [
        { id: '1', name: 'Məktəb #45', sectorId: 's1', sectorName: 'Yasamal', completionRate: 87.5, total: 40 },
        { id: '2', name: 'Məktəb #28', sectorId: 's1', sectorName: 'Yasamal', completionRate: 70, total: 40 }
      ],
      approvalRate: 75,
      completionRate: 78
    };
    
    return mockData;
  };

  // SchoolAdmin Dashboard məlumatlarını əldə etmək
  const fetchSchoolAdminData = async (userId: string): Promise<SchoolAdminDashboardData> => {
    // İmitasiya edilmiş məlumatlar (daha sonra real API endpoint istifadə ediləcək)
    const mockData: SchoolAdminDashboardData = {
      upcomingDeadlines: [
        { id: '1', title: 'İllik hesabat', status: 'pending', progress: 65, dueDate: new Date(Date.now() + 86400000 * 2).toISOString() },
        { id: '2', title: 'Şagird məlumatları', status: 'pending', progress: 30, dueDate: new Date(Date.now() + 86400000 * 5).toISOString() }
      ],
      recentForms: [
        { id: '3', title: 'Müəllim məlumatları', status: 'approved', progress: 100 },
        { id: '4', title: 'İnfrastruktur hesabatı', status: 'rejected', progress: 80 }
      ],
      summary: {
        totalForms: 12,
        completedForms: 8,
        pendingForms: 3,
        overdueForms: 1,
        completionRate: 67
      },
      recentActivity: [
        { id: '1', type: 'form_rejected', title: 'Form rədd edildi', description: 'İnfrastruktur hesabatı', timestamp: new Date().toISOString(), user: 'Sektor Admin' }
      ],
      notifications: [
        { 
          id: '1', 
          title: 'Təcili bildiriş', 
          message: 'İllik hesabatın son təqdim tarixi yaxınlaşır', 
          type: 'warning',
          isRead: false,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        }
      ],
      formStats: {
        pending: 3,
        approved: 8,
        rejected: 1,
        total: 12,
        incomplete: 2,
        drafts: 1,
        dueSoon: 2,
        overdue: 1
      },
      approvalRate: 80,
      completionRate: 67
    };
    
    return mockData;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loadingDashboard')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg flex flex-col items-center justify-center h-64">
        <h3 className="text-xl font-medium text-destructive mb-2">{t('dashboardLoadError')}</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // İstifadəçinin roluna uyğun dashboard komponentini göstəririk
  if (!user || !dashboardData) return null;

  switch (user.role) {
    case 'superadmin':
      return <SuperAdminDashboard data={dashboardData as SuperAdminDashboardData} />;
    case 'regionadmin':
      return <RegionAdminDashboard data={dashboardData as RegionAdminDashboardData} />;
    case 'sectoradmin':
      return <SectorAdminDashboard data={dashboardData as SectorAdminDashboardData} />;
    case 'schooladmin':
      return <SchoolAdminDashboard data={dashboardData as SchoolAdminDashboardData} isLoading={false} />;
    default:
      return (
        <div className="bg-destructive/10 p-6 rounded-lg">
          <p className="text-destructive">{t('unknownUserRole')} {user.role}</p>
        </div>
      );
  }
};

export default DashboardContent;
