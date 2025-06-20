import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { DashboardFormStats } from "@/types/dashboard";
import StatsGrid from "../StatsGrid";
import DashboardChart from "../DashboardChart";
import SchoolsTable from "./SchoolsTable";

interface SectorAdminDashboardProps {
  dashboardData?: any;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t("loading") || "Yüklənir..."}</div>
    );
  }

  console.log("[SectorAdminDashboard] Dashboard data:", dashboardData);

  // Real Backend Data
  const formStats: DashboardFormStats = {
    completedForms: dashboardData.formStats?.completedForms || 0,
    pendingForms: dashboardData.formStats?.pendingForms || 0,
    approvalRate: dashboardData.formStats?.approvalRate || 0,
    total: dashboardData.formStats?.total || 0,
    completed: dashboardData.formStats?.completed || 0,
    approved: dashboardData.formStats?.approved || 0,
    pending: dashboardData.formStats?.pending || 0,
    rejected: dashboardData.formStats?.rejected || 0,
    draft: dashboardData.formStats?.draft || 0,
    dueSoon: dashboardData.formStats?.dueSoon || 0,
    overdue: dashboardData.formStats?.overdue || 0,
    percentage:
      dashboardData.formStats?.percentage || dashboardData.completionRate || 0,
    completion_rate:
      dashboardData.formStats?.completion_rate ||
      dashboardData.completionRate ||
      0,
    completionRate:
      dashboardData.formStats?.completionRate ||
      dashboardData.completionRate ||
      0,
  };

  // Məcburi xassələri təyin edirik
  formStats.totalForms = formStats.total || 0;
  formStats.pendingApprovals = formStats.pendingForms || 0;
  formStats.rejectedForms = formStats.rejected || 0;

  const statsGridData = [
    {
      title: t("dashboard.totalApproved") || "Təsdiqlənmiş",
      value: formStats.approved || 0,
      icon: "check-circle",
      color: "text-green-600",
      description: t("approved") || "Təsdiqləndi",
    },
    {
      title: t("dashboard.totalPending") || "Gözləyən",
      value: formStats.pending || 0,
      icon: "clock",
      color: "text-yellow-600",
      description: t("pending") || "Gözləyir",
    },
    {
      title: t("dashboard.totalRejected") || "Rədd edilmiş",
      value: formStats.rejected || 0,
      icon: "x-circle",
      color: "text-red-600",
      description: t("rejected") || "Rədd edildi",
    },
    {
      title: t("dashboard.completion") || "Tamamlanma",
      value: `${Math.round(formStats.percentage || 0)}%`,
      icon: "pie-chart",
      color: "text-blue-600",
      description: t("completionRate") || "Tamamlanma dərəcəsi",
    },
  ];

  // Real schools data
  const schools = dashboardData.schools || [];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={formStats} />
        <SchoolsTable schools={schools} />
      </div>
    </div>
  );
};

export default SectorAdminDashboard;
