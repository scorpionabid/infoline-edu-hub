
import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFormStats, StatsGridItem } from "@/types/dashboard";
import StatsGrid from "./StatsGrid";
import DashboardChart from "./DashboardChart";
import { BarChart3, Users, School, MapPin } from "lucide-react";

interface SuperAdminDashboardProps {
  dashboardData?: any;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t("dashboard.loading")}</div>
    );
  }

  // Use real data from the backend with all required properties
  const formStats: DashboardFormStats = {
    totalForms: dashboardData.formsByStatus?.total || 0,
    completedForms: dashboardData.formsByStatus?.approved || 0,
    pendingApprovals: dashboardData.formsByStatus?.pending || 0,
    rejectedForms: dashboardData.formsByStatus?.rejected || 0,
    pendingForms: dashboardData.formsByStatus?.pending || 0,
    approvalRate: dashboardData.approvalRate || 0,
    total: dashboardData.formsByStatus?.total || 0,
    completed: dashboardData.formsByStatus?.approved || 0,
    approved: dashboardData.formsByStatus?.approved || 0,
    pending: dashboardData.formsByStatus?.pending || 0,
    rejected: dashboardData.formsByStatus?.rejected || 0,
    dueSoon: 0,
    overdue: 0,
    draft: 0,
    percentage: dashboardData.completionRate || 0,
    completion_rate: dashboardData.completionRate || 0,
    completionRate: dashboardData.completionRate || 0,
  };

  const statsGridData: StatsGridItem[] = [
    {
      title: t("status.approved"),
      value: formStats.approved || 0,
      color: "text-green-600",
      description: t("status.approved"),
      icon: "check-circle"
    },
    {
      title: t("status.pending"),
      value: formStats.pending || 0,
      color: "text-yellow-600", 
      description: t("status.pending"),
      icon: "clock"
    },
    {
      title: t("status.rejected"),
      value: formStats.rejected || 0,
      color: "text-red-600",
      description: t("status.rejected"),
      icon: "x-circle"
    },
    {
      title: t("dashboard.stats.completion_rate"),
      value: `${Math.round(formStats.percentage || 0)}%`,
      color: "text-blue-600",
      description: t("dashboard.stats.completion_rate"),
      icon: "bar-chart"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.superadmin.total_users")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.superadmin.system_users")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.superadmin.total_schools")}
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalSchools || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.superadmin.registered_schools")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.superadmin.total_regions")}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalRegions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.superadmin.management_regions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.superadmin.completion")}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData.completionRate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.superadmin.average_completion")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              {t("general.form_statistics")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart stats={formStats} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("general.recent_activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.regions?.slice(0, 3).map((region: any) => (
                <div key={region.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {region.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {region.sectorCount} sektor •{" "}
                      {region.adminEmail || t("user.admin_not_assigned")}
                    </p>
                  </div>
                </div>
              ))}

              {(!dashboardData.regions ||
                dashboardData.regions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("dashboard.superadmin.no_activity_yet")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <StatsGrid stats={statsGridData} />
    </div>
  );
};

export default SuperAdminDashboard;
