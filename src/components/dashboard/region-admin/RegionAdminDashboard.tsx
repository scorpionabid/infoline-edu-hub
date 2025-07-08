import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { DashboardFormStats, EnhancedDashboardData } from "@/types/dashboard";
import StatsGrid from "../StatsGrid";
import DashboardChart from "../DashboardChart";
import SectorStatsTable from "./SectorStatsTable";
import NotificationsCard from "@/components/dashboard/common/NotificationsCard";

interface RegionAdminDashboardProps {
  dashboardData?: EnhancedDashboardData;
}

const RegionAdminDashboard: React.FC<RegionAdminDashboardProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();
  console.log('🏫 [RegionAdminDashboard] Rendering with data:', dashboardData);

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t("loading") || "Yüklənir..."}</div>
    );
  }

  // Real Backend Data with all required properties
  const formStats: DashboardFormStats = {
    total: dashboardData.formStats?.total || 0,
    completed: dashboardData.formStats?.completed || 0,
    pending: dashboardData.formStats?.pending || 0,
    rejected: dashboardData.formStats?.rejected || 0,
    approved: dashboardData.formStats?.approved || 0,
    completionRate: dashboardData.formStats?.completionRate || dashboardData.completionRate || 0,
    // Əlavə tələb olunan xassələr
    totalForms: dashboardData.formStats?.total || 0,
    completedForms: dashboardData.formStats?.completed || 0,
    pendingForms: dashboardData.formStats?.pending || 0,
    pendingApprovals: dashboardData.formStats?.pending || 0,
    rejectedForms: dashboardData.formStats?.rejected || 0,
    approvalRate: dashboardData.formStats?.approved ? (dashboardData.formStats.approved / dashboardData.formStats.total) * 100 : 0,
    draft: dashboardData.formStats?.draft || 0,
    dueSoon: dashboardData.formStats?.dueSoon || 0,
    overdue: dashboardData.formStats?.overdue || 0,
    percentage: dashboardData.formStats?.completionRate || dashboardData.completionRate || 0,
    completion_rate: dashboardData.formStats?.completionRate || dashboardData.completionRate || 0, // Eyni dəyəri snake_case formatında da saxlayırıq,
  };

  // Display statistics for region admin dashboard - 3 unique cards only
  const statsGridData = [
    {
      title: t("dashboard.stats.total_sectors") || "Ümumi sektorlar",
      value: dashboardData.totalSectors || 0,
      icon: "layers", 
      color: "text-indigo-600",
      description: t("sectors.title") || "Sektor",
    },
    {
      title: t("dashboard.stats.pending_approvals") || "Təsdiq gözləyənlər",
      value: dashboardData.pendingApprovals || 0,
      icon: "clock",
      color: "text-yellow-600",
      description: t("status.pending") || "Gözləyir",
    },
    {
      title: t("dashboard.stats.completion_rate") || "Tamamlanma nisbəti",
      value: `${Math.round(dashboardData.completionRate || 0)}%`,
      icon: "pie-chart",
      color: "text-green-600",
      description: "Real tamamlanma nisbəti",
    },
  ];

  // Get sectors from the enhanced dashboard data structure with real completion rates
  const sectors = dashboardData.sectors || [];
  console.log('🏫 [RegionAdminDashboard] Sectors data:', sectors);

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardChart stats={formStats} />
        <NotificationsCard maxNotifications={5} />
      </div>
      
      <SectorStatsTable sectors={sectors} />
    </div>
  );
};

export default RegionAdminDashboard;
