import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { DashboardFormStats } from "@/types/dashboard";
import StatsGrid from "../StatsGrid";
import DashboardChart from "../DashboardChart";
import SchoolsTable from "./SchoolsTable";
import SchoolDataEntryDialog from "./SchoolDataEntryDialog";
import { School } from "@/types/school";
import { useSchoolsQuery } from "@/hooks/schools";
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";

interface SectorAdminDashboardProps {
  dashboardData?: any;
}

const SectorAdminDashboard: React.FC<SectorAdminDashboardProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);
  
  // Modal state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDataEntryDialogOpen, setIsDataEntryDialogOpen] = useState(false);
  
  // Get schools data for school lookup
  const { schools } = useSchoolsQuery({
    regionId: user?.role === 'regionadmin' ? user.region_id : undefined,
    sectorId: user?.role === 'sectoradmin' ? user.sector_id : undefined,
    enabled: true
  });
  
  // Handler for school click
  const handleSchoolView = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      setSelectedSchool(school);
      setIsDataEntryDialogOpen(true);
    }
  };

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">{t("loading") || "Yüklənir..."}</div>
    );
  }

  console.log("[SectorAdminDashboard] Dashboard data:", dashboardData);

  // Real Backend Data with all required properties
  const formStats: DashboardFormStats = {
    totalForms: dashboardData.formStats?.total || 0,
    completedForms: dashboardData.formStats?.completedForms || 0,
    pendingApprovals: dashboardData.formStats?.pendingForms || 0,
    rejectedForms: dashboardData.formStats?.rejected || 0,
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

  // No need to pass schools data since SchoolsTable fetches its own data
  // const schools = dashboardData.schools || [];

  return (
    <div className="space-y-6">
      <StatsGrid stats={statsGridData} />

      <div className="space-y-6">
        <DashboardChart stats={formStats} />
        <SchoolsTable onView={handleSchoolView} />
      </div>
      
      {/* School Data Entry Modal */}
      <SchoolDataEntryDialog
        open={isDataEntryDialogOpen}
        onOpenChange={setIsDataEntryDialogOpen}
        school={selectedSchool}
      />
    </div>
  );
};

export default SectorAdminDashboard;
