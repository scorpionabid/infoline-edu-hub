
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './RegionAdminDashboard';
import { SectorAdminDashboard } from './sector-admin/SectorAdminDashboard';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';
import {
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData
} from '@/types/dashboard';

const DashboardContent = () => {
  const { t } = useLanguage();
  const { userRole } = usePermissions();
  const { user } = useAuth();
  
  // Mock data obyektləri
  const superAdminData: SuperAdminDashboardData = {
    statistics: {
      users: { total: 0, active: 0, inactive: 0 },
      regions: { total: 0, active: 0, inactive: 0 },
      sectors: { total: 0, active: 0, inactive: 0 },
      schools: { total: 0, active: 0, inactive: 0 },
      categories: { total: 0, active: 0, inactive: 0, pending: 0, completed: 0 }
    },
    latestActivities: []
  };
  
  const regionAdminData: RegionAdminDashboardData = {
    statistics: {
      sectors: { total: 0, active: 0, inactive: 0 },
      schools: { total: 0, active: 0, inactive: 0 },
      submissions: { total: 0, active: 0, inactive: 0, pending: 0, completed: 0 }
    },
    regions: [],
    latestActivities: []
  };
  
  const sectorAdminData: SectorAdminDashboardData = { 
    statistics: {
      totalSchools: 0,
      activeSchools: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0
    },
    schools: [],
    sectors: []
  };
  
  const schoolAdminData: SchoolAdminDashboardData = {
    statistics: {
      categories: { total: 0, active: 0, inactive: 0 },
      submissions: { total: 0, active: 0, inactive: 0, pending: 0, completed: 0 },
      approvals: { total: 0, active: 0, inactive: 0 }
    },
    activities: [],
    notifications: []
  };
  
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
