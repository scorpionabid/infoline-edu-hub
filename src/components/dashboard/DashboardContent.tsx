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
  
  return (
    <div className="px-4 py-8 md:px-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">
          {t('welcomeMessage')} {user?.fullName || ''}
        </h1>
      </div>

      {userRole === 'superadmin' && (
        <SuperAdminDashboard />
      )}
      
      {userRole === 'regionadmin' && (
        <RegionAdminDashboard />
      )}
      
      {userRole === 'sectoradmin' && (
        <SectorAdminDashboard />
      )}
      
      {userRole === 'schooladmin' && (
        <SchoolAdminDashboard />
      )}
    </div>
  );
};

export default DashboardContent;
