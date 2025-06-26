
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { UserRole } from '@/types/auth';

// Normalize role function (moved from deleted role.ts)
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
  
  // Ensure we have a properly normalized role
  const userRole = normalizeRole(rawUserRole);
  
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard.tsx] Component rendering. State:', { 
    loading: isLoading, 
    authInitialized,
    isAuthenticated, 
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    rawUserRole,
    normalizedRole: userRole
  });

  // Initialize auth once
  useEffect(() => {
    const initializeAuth = async () => {
      if (!authInitialized) {
        console.log('[Dashboard.tsx] Initializing auth');
        try {
          await useAuthStore.getState().initializeAuth();
        } catch (error) {
          console.error('[Dashboard.tsx] Auth initialization failed:', error);
        } finally {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();
  }, [authInitialized]);

  // Handle authentication state changes
  useEffect(() => {
    if (!authInitialized) {
      return; // Wait for auth to initialize
    }

    console.log('[Dashboard.tsx] Auth state effect triggered. State:', { 
      isAuthenticated, 
      isLoading, 
      user: !!user,
      userRole 
    });

    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      console.log("[Dashboard.tsx] Not authenticated, redirecting to login.");
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }

    // If authenticated but no user data, show error and logout
    if (isAuthenticated && !user) {
      console.error("[Dashboard.tsx] Authenticated but no user data available");
      toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
        description: 'Zəhmət olmasa, yenidən daxil olun',
      });
      
      // Logout and redirect to login
      useAuthStore.getState().logout();
      navigate('/login', { replace: true });
      return;
    }

    // If authenticated and user exists but no role, try to refresh
    if (isAuthenticated && user && !user.role) {
      console.warn("[Dashboard.tsx] User exists but role is missing, refreshing session");
      useAuthStore.getState().initializeAuth(true);
    }
  }, [authInitialized, isAuthenticated, isLoading, user, navigate, location, userRole]);

  // Show loading state during initialization or auth loading
  if (!authInitialized || isLoading) {
    console.log('[Dashboard.tsx] Showing loading spinner');
    return <LoadingScreen message="Yüklənir, zəhmət olmasa gözləyin..." />;
  }

  // Not authenticated, will be redirected in useEffect
  if (!isAuthenticated || !user) {
    console.log('[Dashboard.tsx] Not authenticated or no user, returning null');
    return null;
  }
  
  console.log('[Dashboard.tsx] Rendering authenticated dashboard', { user: user.id, userRole });

  // Check if user is a school admin for showing the setup check
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
