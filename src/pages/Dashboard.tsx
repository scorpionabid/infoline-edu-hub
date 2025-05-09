// Dashboard.tsx - Add diagnostic logs

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardContent from '@/components/dashboard/DashboardContent';
import SchoolAdminSetupCheck from '@/components/setup/SchoolAdminSetupCheck';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [initialCheck, setInitialCheck] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[Dashboard.tsx] Component rendering. State:', { loading, initialCheck, isAuthenticated, user });

  useEffect(() => {
    console.log('[Dashboard.tsx] useEffect triggered. Deps:', { isAuthenticated, loading, user });
    if (!loading) {
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
  }, [isAuthenticated, loading, user, navigate, location]);

  if (loading || initialCheck) {
    console.log('[Dashboard.tsx] Render: Showing loading spinner because loading or initialCheck is true.', { loading, initialCheck });
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  console.log('[Dashboard.tsx] Render: Passed loading/initialCheck guard.');

  if (!isAuthenticated || !user) {
    console.log('[Dashboard.tsx] Render: Not authenticated or no user, returning null. This might indicate a problem if redirection was expected.', { isAuthenticated, user });
    return null;
  }
  console.log('[Dashboard.tsx] Render: Authenticated and user exists. Proceeding to render content.', { user });

  const isSchoolAdmin = user.role === 'schooladmin';

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
