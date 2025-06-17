
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import AuthDebugger from '@/components/debug/AuthDebugger';
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
  
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard.tsx] Component rendering. State:', { 
    loading: isLoading, 
    initialCheck, 
    isAuthenticated, 
    user: user ? { id: user.id, role: user.role, email: user.email } : null,
    rawUserRole,
    normalizedRole: userRole,
    authStoreState: useAuthStore.getState()
  });

  // Initialize auth if not already done
  useEffect(() => {
    if (!useAuthStore.getState().initialized) {
      console.log('[Dashboard.tsx] Initializing auth');
      useAuthStore.getState().initializeAuth();
    }
  }, []);

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    console.log('[Dashboard.tsx] useEffect triggered. Deps:', { isAuthenticated, isLoading, user, userRole });
    
    // Only run when loading completes
    if (!isLoading) {
      console.log('[Dashboard.tsx] useEffect: Auth loading is false. Setting initialCheck to false.');
      setInitialCheck(false);

      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        console.log("[Dashboard.tsx] useEffect: Not authenticated, redirecting to login.");
        navigate('/login', { state: { from: location } });
        return;
      }

      // Check for user data
      if (isAuthenticated && !user) {
        console.error("[Dashboard.tsx] useEffect: Authenticated but no user data. This is problematic.");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
        
        // Logout if user data is missing
        useAuthStore.getState().logout();
      } else if (isAuthenticated && user && !user.role) {
        console.error("[Dashboard.tsx] useEffect: User exists but role is missing. Trying to refresh session.");
        // Try to refresh the session to get the role
        useAuthStore.getState().initializeAuth(true);
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, location]);

  // Show loading state during initial check or authentication loading
  if (isLoading || initialCheck) {
    console.log('[Dashboard.tsx] Render: Showing loading spinner because loading or initialCheck is true.', { isLoading, initialCheck });
    return <LoadingScreen message="Yüklənir, zəhmət olmasa gözləyin..." />;
  }

  // Not authenticated, will be redirected in useEffect
  if (!isAuthenticated || !user) {
    console.log('[Dashboard.tsx] Render: Not authenticated or no user, returning null.', { isAuthenticated, user });
    return null;
  }
  
  console.log('[Dashboard.tsx] Render: Authenticated and user exists. Proceeding to render content.', { user, userRole });

  // Check if user is a school admin for showing the setup check
  const isSchoolAdmin = userRole === 'schooladmin';

  return (
    <div className="space-y-3">
      <AuthDebugger />
      <DashboardHeader />
      
      {isSchoolAdmin && (
        <>
          <SchoolAdminSetupCheck />
        </>
      )}
      
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
