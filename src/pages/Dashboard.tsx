
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import LoadingScreen from '@/components/auth/LoadingScreen';
import { UserRole } from '@/types/supabase';

const Dashboard: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole) as UserRole | null;
  
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard.tsx] Component rendering. State:', { 
    loading: isLoading, 
    initialCheck, 
    isAuthenticated, 
    user,
    userRole,
    role: user?.role 
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
    
    // Yalnız yüklənmə tamamlandıqda işləsin
    if (!isLoading) {
      console.log('[Dashboard.tsx] useEffect: Auth loading is false. Setting initialCheck to false.');
      setInitialCheck(false);

      // Autentifikasiya olmayıbsa login səhifəsinə yönləndir
      if (!isAuthenticated) {
        console.log("[Dashboard.tsx] useEffect: Not authenticated, redirecting to login.");
        navigate('/login', { state: { from: location } });
        return;
      }

      // İstifadəçi data yoxlama
      if (isAuthenticated && !user) {
        console.error("[Dashboard.tsx] useEffect: Authenticated but no user data. This is problematic.");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
        
        // İstifadəçi məlumatları yoxdursa, sessiyanı çıxış etdir
        useAuthStore.getState().logout();
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

  // Tip xətalarını aradan qaldırmaq üçün etibarlı bir rol təyin edirik
  const roleForDisplay = userRole || user?.role || 'unknown';
  const isSchoolAdmin = roleForDisplay === 'schooladmin';

  return (
    <div className="space-y-3">
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
