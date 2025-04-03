import { getBaseDashboardData } from "./baseProvider";
import { DashboardData, FormStatus, SchoolAdminDashboardData } from "@/types/dashboard";

export const getSchoolAdminDashboardData = (userId: string): SchoolAdminDashboardData => {
  // Base datanı əldə edirik
  const baseData = getBaseDashboardData();

  return {
    ...baseData,
    schoolName: "Bakı 220 saylı orta məktəb",
    sectorName: "Binəqədi rayonu",
    regionName: "Bakı şəhəri",
    forms: {
      pending: 4,
      approved: 8,
      rejected: 1,
      dueSoon: 2,
      overdue: 1
    },
    completionRate: 66,
    pendingForms: [
      {
        id: "1",
        title: "Müəllim məlumatları",
        status: "pending" as FormStatus,
        completionPercentage: 45,
        category: "Kadrlar"
      },
      {
        id: "2",
        title: "İnfrastruktur məlumatları",
        status: "pending" as FormStatus,
        completionPercentage: 30,
        category: "İnfrastruktur"
      }
    ],
    recentForms: [
      {
        id: "5",
        title: "Dərs saatları",
        status: "approved" as FormStatus,
        completionPercentage: 100,
        category: "Dərs"
      }
    ],
    totalCategories: 15,
    completedCategories: 10,
    pendingCategories: 5,
    totalForms: 16,
    completedForms: []
  };
};
