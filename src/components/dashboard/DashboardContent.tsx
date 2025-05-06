
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './region-admin/RegionAdminDashboard';
import { SectorAdminDashboard } from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import {
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SchoolAdminDashboardData
} from '@/types/dashboard';

const DashboardContent = () => {
  const { t } = useLanguage();
  const { currentRole } = usePermissions();
  const { user } = useAuth();
  
  // Mock data obyektləri
  const superAdminData: SuperAdminDashboardData = {
    stats: {
      totalUsers: 0,
      totalSchools: 0,
      totalRegions: 0,
      totalSectors: 0,
    },
    formsByStatus: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      submitted: 0,
    },
    completionRate: 0,
    notifications: []
  };
  
  const regionAdminData: RegionAdminDashboardData = {
    stats: {
      sectors: 0,
      schools: 0,
      users: 0,
      totalSchools: 0,
      totalSectors: 0,
      totalForms: 0,
      totalCategories: 0
    },
    sectorStats: [],
    schoolStats: [],
    completionRate: 0,
    notifications: []
  };
  
  const sectorAdminData = { 
    statistics: {
      totalSchools: 0,
      activeSchools: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0
    },
    schools: []
  };
  
  const schoolAdminData: SchoolAdminDashboardData = {
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
    recentForms: [],
    upcomingDeadlines: [],
    completionRate: 0,
    notifications: []
  };
  
  return (
    <div className="px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">
          {t('welcomeMessage')} {user?.full_name || ''}
        </h1>
      </div>

      {currentRole === 'superadmin' && (
        <SuperAdminDashboard data={superAdminData} />
      )}
      
      {currentRole === 'regionadmin' && (
        <RegionAdminDashboard data={regionAdminData} />
      )}
      
      {currentRole === 'sectoradmin' && (
        <SectorAdminDashboard data={sectorAdminData} />
      )}
      
      {currentRole === 'schooladmin' && (
        <SchoolAdminDashboard 
          data={schoolAdminData}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default DashboardContent;
