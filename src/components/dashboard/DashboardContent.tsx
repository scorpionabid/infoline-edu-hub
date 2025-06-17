
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAuthStore,
  selectUser,
  selectUserRole,
} from "@/hooks/auth/useAuthStore";
import { useTranslation } from "@/contexts/TranslationContext";
import { useRealDashboardData } from "@/hooks/dashboard/useRealDashboardData";
import LoadingScreen from "@/components/auth/LoadingScreen";
import SuperAdminDashboard from "./SuperAdminDashboard";
import RegionAdminDashboard from "./region-admin/RegionAdminDashboard";
import SectorAdminDashboard from "./sector-admin/SectorAdminDashboard";
import SchoolAdminDashboard from "./school-admin/SchoolAdminDashboard";
import TranslationWrapper from "@/components/translation/TranslationWrapper";
import { toast } from "sonner";

const DashboardContent: React.FC = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { t, isLoading: translationLoading, isReady } = useTranslation();

  const { loading, error, dashboardData } = useRealDashboardData();

  console.log("[DashboardContent] Dashboard state:", {
    dashboardData,
    loading,
    error,
    userRole,
    translationLoading,
    isReady
  });

  // Show loading only if both translation and dashboard are loading
  if (loading || (!isReady && translationLoading)) {
    return <LoadingScreen message="İdarə paneli yüklənir..." />;
  }

  if (error) {
    console.error("[DashboardContent] Dashboard data error:", error);
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
    switch (userRole) {
      case "superadmin":
        return <SuperAdminDashboard dashboardData={dashboardData} />;

      case "regionadmin":
        return <RegionAdminDashboard dashboardData={dashboardData} />;

      case "sectoradmin":
        return <SectorAdminDashboard dashboardData={dashboardData} />;

      case "schooladmin":
        return <SchoolAdminDashboard dashboardData={dashboardData} />;

      default:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t("dashboard.subtitle")}</p>
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
