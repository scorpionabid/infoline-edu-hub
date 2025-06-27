
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { UserRole } from '@/types/auth';

// Normalize role function
const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return 'schooladmin';
  
  switch (role.toLowerCase()) {
    case 'superadmin':
    case 'super_admin':
    case 'super-admin':
      return 'superadmin';
    case 'regionadmin':
    case 'region_admin':
    case 'region-admin':
      return 'regionadmin';
    case 'sectoradmin':
    case 'sector_admin':
    case 'sector-admin':
      return 'sectoradmin';
    case 'schooladmin':
    case 'school_admin':
    case 'school-admin':
      return 'schooladmin';
    default:
      return 'schooladmin';
  }
};

const Dashboard: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const rawUserRole = useAuthStore(selectUserRole);
  const userRole = normalizeRole(rawUserRole);
  
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard] Rendering with state:', { 
    isLoading, 
    isAuthenticated, 
    hasUser: !!user,
    userRole
  });

  // Single auth check effect
  useEffect(() => {
    console.log('[Dashboard] Auth state check:', { 
      isAuthenticated, 
      isLoading, 
      hasUser: !!user 
    });

    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to login');
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    // Handle authenticated but no user data
    if (isAuthenticated && !user) {
      console.error('[Dashboard] Authenticated but no user data');
      toast.error('İstifadəçi məlumatları yüklənə bilmədi', {
        description: 'Zəhmət olmasa, yenidən daxil olun',
      });
      
      useAuthStore.getState().signOut();
      navigate('/login', { replace: true });
      return;
    }

  }, [isAuthenticated, isLoading, user, navigate, location]);

  // Show loading during auth check
  if (isLoading) {
    console.log('[Dashboard] Showing loading screen');
    return <LoadingScreen message="Yüklənir..." />;
  }

  // Not authenticated - will redirect
  if (!isAuthenticated || !user) {
    console.log('[Dashboard] Not authenticated or no user');
    return null;
  }
  
  console.log('[Dashboard] Rendering authenticated dashboard');

  const isSchoolAdmin = userRole === 'schooladmin';

  return (
    <div className="space-y-3">
      <DashboardHeader />
      
      {isSchoolAdmin && (
        <SchoolAdminSetupCheck />
      )}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
