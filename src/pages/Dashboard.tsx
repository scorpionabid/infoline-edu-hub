
import React, { useState, useEffect } from 'react';
import { useAuthStore, selectIsAuthenticated, selectIsLoading, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/auth';
import LoadingScreen from '@/components/auth/LoadingScreen';

const Dashboard: React.FC = () => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { userRole: permissionRole } = usePermissions();
  
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard.tsx] Component rendering. State:', { 
    loading: isLoading, 
    initialCheck, 
    isAuthenticated, 
    user,
    userRole,
    permissionRole,
    role: user?.role 
  });

  useEffect(() => {
    console.log('[Dashboard.tsx] useEffect triggered. Deps:', { isAuthenticated, isLoading, user, userRole });
    
    if (!isLoading) {
      console.log('[Dashboard.tsx] useEffect: Auth loading is false. Setting initialCheck to false.');
      setInitialCheck(false);

      if (!isAuthenticated) {
        console.log("[Dashboard.tsx] useEffect: Not authenticated, redirecting to login.");
        navigate('/login', { state: { from: location } });
        return;
      }

      if (isAuthenticated && !user) {
        console.error("[Dashboard.tsx] useEffect: Authenticated but no user data. This is problematic.");
        toast.error('İstifadəçi məlumatları yüklənərkən xəta baş verdi', {
          description: 'Zəhmət olmasa, yenidən daxil olun',
        });
      } else if (isAuthenticated && user) {
        console.log("[Dashboard.tsx] useEffect: Authenticated with user data.", user);
      }
    } else {
      console.log('[Dashboard.tsx] useEffect: Auth loading is true. Waiting.');
    }
  }, [isAuthenticated, isLoading, user, navigate, location, userRole]);

  // Show loading state during initial check or authentication loading
  if (isLoading || initialCheck) {
    console.log('[Dashboard.tsx] Render: Showing loading spinner because loading or initialCheck is true.', { isLoading, initialCheck });
    return <LoadingScreen message="Yüklənir, zəhmət olmasa gözləyin..." />;
  }

  // Not authenticated, will be redirected in useEffect
  if (!isAuthenticated || !user) {
    console.log('[Dashboard.tsx] Render: Not authenticated or no user, returning null. This might indicate a problem if redirection was expected.', { isAuthenticated, user });
    return null;
  }
  
  console.log('[Dashboard.tsx] Render: Authenticated and user exists. Proceeding to render content.', { user, userRole });

  const roleForDisplay = userRole || user?.role || 'unknown';
  const isSchoolAdmin = roleForDisplay === 'schooladmin';

  // If no appropriate dashboard is found, show a helpful message
  if (!roleForDisplay || roleForDisplay === 'unknown') {
    return (
      <div className="flex items-center justify-center h-screen flex-col space-y-4">
        <h2 className="text-2xl font-semibold">Rolunuza uyğun dashboard tapılmadı</h2>
        <p>Rol: {roleForDisplay || 'Təyin olunmayıb'}</p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
          onClick={() => navigate('/settings')}
        >
          Tənzimləmələr
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {console.log('[Dashboard.tsx] Render: Rendering DashboardHeader.')}
      <DashboardHeader />
      
      {isSchoolAdmin && (
        <>
          {console.log('[Dashboard.tsx] Render: User is schooladmin, rendering SchoolAdminSetupCheck.')}
          <SchoolAdminSetupCheck />
        </>
      )}
      
      {console.log('[Dashboard.tsx] Render: Rendering DashboardContent.')}
      <DashboardContent />
      {console.log('[Dashboard.tsx] Render: Finished rendering content.')}
    </div>
  );
};

export default Dashboard;
