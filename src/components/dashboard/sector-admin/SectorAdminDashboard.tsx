
import React, { useState } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { DashboardFormStats } from "@/types/dashboard";
import { Card, CardContent } from "@/components/ui/card";
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

  // Use the consolidated data structure
  const summary = dashboardData?.stats || {
    totalEntries: 0,
    completedEntries: 0,
    pendingEntries: 0,
    rejectedEntries: 0,
    approvedEntries: 0
  };

  const completionRate = dashboardData?.completionRate || 0;

  console.log("[SectorAdminDashboard] Summary data:", summary);

  const statsGridData = [
    {
      title: t("dashboard.totalApproved") || "Təsdiqlənmiş",
      value: summary.approvedEntries || 0,
      icon: "check-circle",
      color: "text-green-600",
      description: t("status.approved") || "Təsdiqləndi",
    },
    {
      title: t("dashboard.totalPending") || "Gözləyən",
      value: summary.pendingEntries || 0,
      icon: "clock",
      color: "text-yellow-600",
      description: t("status.pending") || "Gözləyir",
    },
    {
      title: t("dashboard.totalRejected") || "Rədd edilmiş",
      value: summary.rejectedEntries || 0,
      icon: "x-circle",
      color: "text-red-600",
      description: t("status.rejected") || "Rədd edildi",
    },
    {
      title: t("dashboard.completion") || "Tamamlanma",
      value: `${Math.round(completionRate)}%`,
      icon: "pie-chart",
      color: "text-blue-600",
      description: t("dashboard.stats.completion_rate") || "Tamamlanma dərəcəsi",
    },
  ];

  // Additional sector-specific stats
  const sectorStats = [
    {
      title: t("dashboard.totalSchools") || "Ümumi Məktəblər",
      value: dashboardData.totalSchools || 0,
      icon: "building",
      color: "text-purple-600",
      description: t("dashboard.schoolsInSector") || "Sektordakı məktəblər",
    },
    {
      title: t("dashboard.totalRequiredFields") || "Tələb Olunan Sahələr",
      value: dashboardData.totalRequiredColumns || 0,
      icon: "list-checks",
      color: "text-indigo-600",
      description: t("dashboard.requiredFields") || "Məcburi sahələr",
    },
    {
      title: t("dashboard.totalPossibleEntries") || "Mümkün Girişlər",
      value: dashboardData.totalPossibleEntries || 0,
      icon: "target",
      color: "text-orange-600",
      description: t("dashboard.allPossibleEntries") || "Bütün mümkün girişlər",
    },
    {
      title: t("dashboard.pendingApprovals") || "Təsdiq Gözləyən",
      value: dashboardData.pendingApprovals || 0,
      icon: "hourglass",
      color: "text-amber-600",
      description: t("dashboard.awaitingApproval") || "Təsdiq gözləyir",
    },
  ];

  // Create enhanced form stats for chart
  const enhancedFormStats: DashboardFormStats = {
    totalForms: summary.totalEntries || 0,
    completedForms: summary.completedEntries || 0,
    pendingForms: summary.pendingEntries || 0,
    rejectedForms: summary.rejectedEntries || 0,
    approved: summary.approvedEntries || 0,
    pending: summary.pendingEntries || 0,
    rejected: summary.rejectedEntries || 0,
    completed: summary.completedEntries || 0,
    total: summary.totalEntries || 0,
    pendingApprovals: summary.pendingEntries || 0,
    approvalRate: completionRate,
    draft: 0,
    dueSoon: 0,
    overdue: 0,
    percentage: completionRate,
    completion_rate: completionRate,
    completionRate: completionRate
  };

  console.log("[SectorAdminDashboard] Enhanced form stats for chart:", enhancedFormStats);

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <StatsGrid stats={statsGridData} />

      {/* Additional Sector Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectorStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart and Schools Table */}
      <div className="space-y-6">
        <DashboardChart stats={enhancedFormStats} />
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
