
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { RegionAdminDashboard } from './region-admin/RegionAdminDashboard';
import { SectorAdminDashboard } from './sector-admin/SectorAdminDashboard';
import { SchoolAdminDashboard } from './SchoolAdminDashboard';
import {
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SchoolAdminDashboardData
} from '@/types/dashboard';

const DashboardContent = () => {
  const { t } = useLanguage();
  const { userRole } = usePermissions();
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
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0
    },
    completionRate: 0,
    notifications: []
  };
  
  const regionAdminData: RegionAdminDashboardData = {
    stats: {
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
      incomplete: 0, // əlave edildi
      dueSoon: 0, // əlavə edildi
      overdue: 0 // əlavə edildi
    },
    recentForms: [],
    upcomingDeadlines: [], // əlavə edildi
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
