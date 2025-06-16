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
import { LinksCard } from "./school-admin/LinksCard";
import { FilesCard } from "./school-admin/FilesCard";
import { RegionLinksCard } from "./region-admin/RegionLinksCard";
import { RegionFilesCard } from "./region-admin/RegionFilesCard";
import SectorLinksCard from "./sector-admin/SectorLinksCard";
import { SectorFilesCard } from "./sector-admin/SectorFilesCard";
import { toast } from "sonner";

const DashboardContent: React.FC = () => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);
  const { t } = useTranslation();

  const { loading, error, dashboardData } = useRealDashboardData();

  console.log("[DashboardContent] Real Dashboard Data:", {
    dashboardData,
    loading,
    error,
    userRole,
  });

  if (loading) {
    return <LoadingScreen message="Dashboard yüklənir..." />;
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
        return <SchoolAdminDashboard data={dashboardData} />;

      default:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("welcome")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{t("dashboardDescription")}</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
};

export default DashboardContent;
