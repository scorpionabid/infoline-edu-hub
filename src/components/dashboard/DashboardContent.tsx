
import React, { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useLanguage } from '@/context/LanguageContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import { DashboardStats, FormStats } from '@/types/dashboard';

const DashboardContent: React.FC = () => {
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSchools: 0,
    totalRegions: 0,
    totalSectors: 0,
    schools: [],
    forms: {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      total: 0
    },
    categories: 0,
    users: 0,
    sectors: [],
    regions: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data və ya API'dən məlumatları yükləmək üçün
  useEffect(() => {
    // Əsl sistemdə burada API sorğusu olacaq
    setTimeout(() => {
      setStats({
        totalUsers: 120,
        totalSchools: 450,
        totalRegions: 14,
        totalSectors: 78,
        schools: [],
        forms: {
          pending: 85,
          approved: 347,
          rejected: 42,
          draft: 26,
          total: 500
        },
        categories: 25,
        users: 120,
        sectors: [
          { id: '1', name: 'Bakı şəhəri', schools: 150 },
          { id: '2', name: 'Sumqayıt şəhəri', schools: 75 },
          { id: '3', name: 'Gəncə şəhəri', schools: 52 }
        ],
        regions: []
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
      return <SuperAdminDashboard stats={stats} />;
    
    case 'regionadmin':
      return <RegionAdminDashboard regionId={regionId} />;
    
    case 'sectoradmin':
      return <SectorAdminDashboard sectorId={sectorId} />;
    
    case 'schooladmin':
      return <SchoolAdminDashboard schoolId={schoolId} />;
    
    default:
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          {t('noDataAvailableForRole')}
        </div>
      );
  }
};

export default DashboardContent;
