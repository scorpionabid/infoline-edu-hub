import { DashboardData, FormStatus, SuperAdminDashboardData } from "@/types/dashboard";
import { mockNotifications } from "../mockDashboardData";
import { getBaseDashboardData } from "./baseProvider";

export const getSuperAdminDashboardData = (): SuperAdminDashboardData => {
  // Base datanı əldə edirik
  const baseData = getBaseDashboardData();

  // SuperAdmin-ə xas olan məlumatları əlavə edirik
  return {
    ...baseData,
    regions: 12,
    sectors: 72,
    schools: 586,
    users: 1254,
    completionRate: 74,
    pendingApprovals: 156,
    pendingSchools: 45,
    approvedSchools: 538,
    rejectedSchools: 3,
    statusData: {
      completed: 538,
      pending: 45,
      rejected: 3,
      notStarted: 0
    },
    activityData: [
      { id: "1", action: "Məlumatların təsdiqi", actor: "Nəsimi rayon admini", target: "28 saylı məktəb", time: "15 dəq əvvəl" },
      { id: "2", action: "Yeni kateqoriya", actor: "SuperAdmin", target: "Bütün məktəblər", time: "2 saat əvvəl" },
      { id: "3", action: "Məlumat redaktəsi", actor: "Yasamal rayon admini", target: "158 saylı məktəb", time: "3 saat əvvəl" },
      { id: "4", action: "Admin əlavə edilməsi", actor: "SuperAdmin", target: "Nizami rayon", time: "5 saat əvvəl" }
    ],
    categoryCompletionData: [
      { name: "Müəllimlər", completed: 498 },
      { name: "Şagirdlər", completed: 521 },
      { name: "İnfrastruktur", completed: 312 },
      { name: "Maliyyə", completed: 456 }
    ]
  };
};
