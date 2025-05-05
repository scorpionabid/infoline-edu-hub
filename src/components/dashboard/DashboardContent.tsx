
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './RegionAdminDashboard';
import { SectorAdminDashboard } from './SectorAdminDashboard';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';

const DashboardContent = () => {
  const { t } = useLanguage();
  const { userRole } = usePermissions();
  const { user } = useAuth();
  
  // Boş data obyektləri oluşturaq ki, data propsunu göndərə bilək
  const superAdminData = { statistics: {}, latestActivities: [] };
  const regionAdminData = { statistics: {}, regions: [], latestActivities: [] };
  const sectorAdminData = { 
    statistics: {
      totalSchools: 0,
      activeSchools: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0
    }, 
    schools: [],
    sectors: []
  };
  const schoolAdminData = { statistics: {}, activities: [], notifications: [] };
  
  return (
    <div className="px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">
          {t('welcomeMessage')} {user?.full_name || ''}
        </h1>
      </div>

      {userRole === 'superadmin' && (
        <SuperAdminDashboard data={superAdminData} />
      )}
      
      {userRole === 'regionadmin' && (
        <RegionAdminDashboard data={regionAdminData} />
      )}
      
      {userRole === 'sectoradmin' && (
        <SectorAdminDashboard data={sectorAdminData} />
      )}
      
      {userRole === 'schooladmin' && (
        <SchoolAdminDashboard data={schoolAdminData} />
      )}
    </div>
  );
};

export default DashboardContent;
