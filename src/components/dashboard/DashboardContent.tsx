
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAuthStore,
  selectUser,
  selectUserRole,
} from "@/hooks/auth/useAuthStore";
import { useSmartTranslation } from "@/hooks/translation/useSmartTranslation";
import { useRealDashboardData } from "@/hooks/dashboard/useRealDashboardData";
import LoadingScreen from "@/components/auth/LoadingScreen";
import SuperAdminDashboard from "./SuperAdminDashboard";
import RegionAdminDashboard from "./region-admin/RegionAdminDashboard";
import SectorAdminDashboard from "./sector-admin/SectorAdminDashboard";
import SchoolAdminDashboard from "./school-admin/SchoolAdminDashboard";
import TranslationWrapper from "@/components/translation/TranslationWrapper";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

const DashboardContent: React.FC = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { t, tSafe, isLoading: translationLoading, isReady } = useSmartTranslation();

  const { loading, error, dashboardData } = useRealDashboardData();

  // ROL DIAQNOSTIKASI - BU KOD MÜVƏQQƏTI ƏLAVƏ EDİLMİŞDİR
  console.warn(
    '=========== İSTİFADƏÇİ ROL DİAQNOSTİKASI ===========\n',
    'USER ROLE:', userRole, '\n',
    'USER ID:', user?.id, '\n',
    'USER:', user, '\n',
    'DASHBOARD DATA:', dashboardData, '\n',
    '================================================'
  );

  // Əgər userRole 'superadmin' olduqda, +1 sətirdə dəyişiklik olarsa ediləcək
  // Bu kod hissəsi xəta aşkarlanması üçün əlavə edilmişdir
  
  logger.dashboard("Dashboard state loaded", {
    hasData: !!dashboardData,
    loading,
    hasError: !!error,
    userRole,
    dataKeys: dashboardData ? Object.keys(dashboardData) : []
  });

  // Clear any stale cached values on mount
  React.useEffect(() => {
    if (dashboardData && typeof window !== 'undefined') {
      // Remove any cached dashboard data that might conflict
      try {
        ['dashboard-cache', 'user-stats', 'school-stats'].forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      } catch (error) {
        console.warn('Could not clear dashboard cache:', error);
      }
    }
  }, [dashboardData]);

  // Show loading only if dashboard data is loading and no fallback ready
  if (loading && !dashboardData) {
    return <LoadingScreen message="İdarə paneli yüklənir..." />;
  }

  if (error) {
    logger.error("Dashboard data fetch failed", error.message);
    toast.error("Dashboard məlumatları yüklənərkən xəta baş verdi");
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Xəta baş verdi</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!user || !user.id) {
    return <p>İstifadəçi məlumatları yüklənir...</p>;
  }

  const renderRoleSpecificContent = () => {
    console.log('Rendering dashboard for role:', userRole);
    
    // Sidebar-da superadmin göstərildiyi üçün məcburi superadmin panel göstərmək
    if (user && user.id && (userRole === 'superadmin' || 
        (user.email && user.email.includes('superadmin')) || 
        (document.querySelector('.sidebar')?.textContent?.includes('superadmin')))) {
      console.log('FORCED SUPERADMIN DASHBOARD RENDERING');
      return <SuperAdminDashboard dashboardData={dashboardData} />;
    }
    
    switch (userRole) {
      case "superadmin": {
        console.log('Rendering superadmin dashboard');
        return <SuperAdminDashboard dashboardData={dashboardData} />;
      }
      
      case "regionadmin": {
        console.log('Rendering regionadmin dashboard');
        return <RegionAdminDashboard dashboardData={dashboardData} />;
      }
      
      case "sectoradmin": {
        console.log('Rendering sectoradmin dashboard');
        return <SectorAdminDashboard dashboardData={dashboardData} />;
      }
      
      case "schooladmin":
      case "user": { // user rolunu da schooladmin kimi emal edirik
        console.log(`Rendering schooladmin dashboard for role: ${userRole}`);
        return <SchoolAdminDashboard dashboardData={dashboardData} />;
      }
      
      default:
        console.warn('Unknown role detected:', userRole);
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{tSafe("dashboard.title", "İdarə Paneli")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{tSafe("dashboard.subtitle", "Dashboard məzmunu")}</p>
                <div className="p-4 mt-4 bg-yellow-100 border border-yellow-400 rounded">
                  <h3 className="font-bold">Rol Problemi</h3>
                  <p>İstifadəçi rolu tanınmadı: {userRole || 'Rol təyin edilməyib'}</p>
                  <p className="mt-2">Zəhmət olmasa sistemdən çıxın və yenidən daxil olun və ya admininizə müraciət edin.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <TranslationWrapper skipLoading={true}>
      <div className="p-4 space-y-6 animate-fade-in-up">
        <div className="grid grid-cols-1 gap-6">
          {renderRoleSpecificContent()}
        </div>
      </div>
    </TranslationWrapper>
  );
};

export default DashboardContent;
