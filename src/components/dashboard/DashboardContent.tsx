
import React, { useState, useEffect } from 'react';
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import SuperAdminDashboard from './SuperAdminDashboard';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import { RegionAdminDashboard } from './region-admin/RegionAdminDashboard';
import { UserRole } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStatus, DashboardFormStats } from '@/types/dashboard';

// Mock data for temporary usage
const mockSuperAdminData = { 
  status: { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0, active: 0, inactive: 0 } as DashboardStatus, 
  completion: { total: 0, completed: 0, percentage: 0 },
  regionStats: [],
  sectorStats: []
};

const mockRegionAdminData = { 
  status: { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0, active: 0, inactive: 0 } as DashboardStatus, 
  completion: { total: 0, completed: 0, percentage: 0 }, 
  sectorStats: [], 
  pendingApprovals: [] 
};

const mockSectorAdminData = { 
  status: { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0, active: 0, inactive: 0 } as DashboardStatus, 
  completion: { total: 0, completed: 0, percentage: 0 }, 
  schoolStats: [],
  pendingApprovals: [],
  categories: [],
  upcoming: [],
  pendingForms: [],
  formStats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    total: 0
  } as DashboardFormStats
};

const mockSchoolAdminData = { 
  status: { total: 0, approved: 0, pending: 0, rejected: 0, draft: 0, active: 0, inactive: 0 } as DashboardStatus, 
  completion: { total: 0, completed: 0, percentage: 0 }, 
  categories: [], 
  upcoming: [], 
  pendingForms: [],
  formStats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    total: 0
  } as DashboardFormStats
};

const DashboardContent: React.FC = () => {
  // Get user role directly from the store using selector
  const userRole = useAuthStore(selectUserRole);
  const user = useAuthStore(state => state.user);
  const [roleLoaded, setRoleLoaded] = useState(false);
  
  // Log for debugging
  console.log('[DashboardContent] Current role from selector:', userRole);
  console.log('[DashboardContent] Current user:', user);
  
  useEffect(() => {
    // We use this to ensure that we've attempted to load the role
    // and can show a proper fallback UI instead of infinite loading
    if (userRole !== undefined) {
      setRoleLoaded(true);
    }
  }, [userRole]);

  // Show loading state if we haven't determined if there's a role yet
  if (!roleLoaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  
  // If role is null or undefined after loading, show an error message
  if (!userRole) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">İstifadəçi rolu müəyyən edilmədi</h2>
        <p className="text-gray-500">Yenidən daxil olmağı sınayın və ya administratorla əlaqə saxlayın.</p>
        <p className="mt-4 text-xs text-gray-400">Debug info: User role is null/undefined</p>
      </div>
    );
  }
  
  // Roldan asılı olaraq müvafiq dashboard komponentini göstər
  switch (userRole) {
    case 'superadmin':
      return <SuperAdminDashboard data={mockSuperAdminData} />;
    
    case 'regionadmin':
      return <RegionAdminDashboard data={mockRegionAdminData} />;
    
    case 'sectoradmin':
      return <SectorAdminDashboard data={mockSectorAdminData} />;
    
    case 'schooladmin':
      return <SchoolAdminDashboard data={mockSchoolAdminData} />;
    
    default:
      return (
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Dashboard məlumatları hazırlanır</h2>
          <p>Rol: {userRole}</p>
        </div>
      );
  }
};

export default DashboardContent;
