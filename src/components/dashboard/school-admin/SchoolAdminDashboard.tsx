
import React from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { EnhancedDashboardData } from "@/types/dashboard";
import StatsGrid from "../StatsGrid";
import DashboardChart from "../DashboardChart";

interface SchoolAdminDashboardProps {
  dashboardData?: EnhancedDashboardData;
}

const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t("loading") || "Yüklənir..."}</div>
    );
  }

  const statsGridData = [
    {
      title: t("dashboard.totalForms") || "Ümumi Formlar",
      value: dashboardData.totalForms || 0,
      icon: "file-text",
      color: "text-blue-600",
      description: t("forms.title") || "Form",
    },
    {
      title: t("dashboard.completedForms") || "Tamamlanmış Formlar",
      value: dashboardData.completedForms || 0,
      icon: "check-circle",
      color: "text-green-600",
      description: t("status.completed") || "Tamamlandı",
    },
    {
      title: t("dashboard.pendingForms") || "Gözləyən Formlar",
      value: dashboardData.pendingForms || 0,
      icon: "clock",
      color: "text-yellow-600",
      description: t("status.pending") || "Gözləyir",
    },
    {
      title: t("dashboard.completion") || "Tamamlanma",
      value: `${Math.round(dashboardData.completionRate || 0)}%`,
      icon: "pie-chart",
      color: "text-purple-600",
      description: t("dashboard.stats.completion_rate") || "Tamamlanma dərəcəsi",
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardChart stats={dashboardData.formStats || {
          total: 0,
          completed: 0,
          pending: 0,
          rejected: 0,
          approved: 0,
          completionRate: 0,
          totalForms: 0,
          completedForms: 0,
          pendingForms: 0,
          rejectedForms: 0,
          pendingApprovals: 0,
          approvalRate: 0,
          draft: 0,
          dueSoon: 0,
          overdue: 0,
          percentage: 0,
          completion_rate: 0
        }} />
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
