
import React, { useState, useEffect } from 'react';
import { useAuthStore, selectUserRole } from '@/hooks/auth/useAuthStore';
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import SchoolAdminDashboard from './school-admin/SchoolAdminDashboard';
import SuperAdminDashboard from './super-admin/SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard';
import { UserRole } from '@/types/supabase';
import { useEffect } from 'react';

// Mock data import - bu projede olduğunu varsayıram
import { mockSectorAdminData } from '@/data/mockDashboardData';
import { mockSchoolAdminData } from '@/data/mockDashboardData';
import { mockRegionAdminData } from '@/data/mockDashboardData';
import { mockSuperAdminData } from '@/data/mockDashboardData';

const DashboardContent: React.FC = () => {
  // Zustand'dan istifadəçi rolunu əldə et
  const userRole = useAuthStore(selectUserRole);
  const [role, setRole] = useState<UserRole | null>(null);
  
  // Rolun dəyərini dəyişən roldan asılı olaraq təyin et
  useEffect(() => {
    console.log('[DashboardContent] Setting role from userRole:', userRole);
    if (userRole) {
      setRole(userRole);
    } else {
      // Əgər userRole null-dursa, user obyektdən birbaşa rol almağa çalışırıq
      const user = useAuthStore.getState().user;
      console.log('[DashboardContent] User from store:', user);
      
      if (user?.role) {
        console.log('[DashboardContent] Setting role from user object:', user.role);
        setRole(user.role as UserRole);
      }
    }
  }, [userRole]);

  console.log('[DashboardContent] Current role:', role);
  
  // Əgər rol hələ təyin olunmayıbsa, yükləmə göstər
  if (!role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Roldan asılı olaraq müvafiq dashboard komponentini göstər
  switch (role) {
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
          <p>Rol: {role}</p>
        </div>
      );
  }
};

export default DashboardContent;
