
import {
  RegionStat,
  SectorStat,
  SchoolStat,
  PendingApproval,
  DashboardFormStats
} from '@/types/dashboard';
// Use direct imports instead of non-existent types
import { Category } from '@/types/category';

// Mock data for charts using proper typing
export const generatePieChartData = (completed: number, total: number) => {
  const incomplete = total - completed;
  return [
    {
      name: 'Completed',
      value: completed,
      color: '#10B981'
    },
    {
      name: 'Incomplete',
      value: incomplete,
      color: '#F59E0B'
    }
  ] as { name: string; value: number; color: string }[];
};

export const generateFormStatusData = (stats: DashboardFormStats) => {
  return [
    {
      name: 'Pending',
      value: stats.pending,
      color: '#F59E0B'
    },
    {
      name: 'Approved',
      value: stats.approved,
      color: '#10B981'
    },
    {
      name: 'Rejected',
      value: stats.rejected,
      color: '#EF4444'
    }
  ] as { name: string; value: number; color: string }[];
};

// Mock data for regions with proper typing
export const mockRegions = (): RegionStat[] => {
  return [
    {
      id: "r1",
      name: "Bakı",
      schoolCount: 120,
      sectorCount: 12,
      completionRate: 78
    },
    {
      id: "r2",
      name: "Sumqayıt",
      schoolCount: 45,
      sectorCount: 6,
      completionRate: 65
    },
    {
      id: "r3",
      name: "Gəncə",
      schoolCount: 30,
      sectorCount: 4,
      completionRate: 55
    }
  ];
};

// Mock data for sectors with proper typing
export const mockSectors = (): SectorStat[] => {
  return [
    {
      id: "s1",
      name: "Xətai",
      schoolCount: 25,
      completionRate: 82
    },
    {
      id: "s2",
      name: "Yasamal",
      schoolCount: 18,
      completionRate: 76
    },
    {
      id: "s3",
      name: "Sabunçu",
      schoolCount: 15,
      completionRate: 62
    }
  ];
};

// Mock data for schools with type casting to handle pendingCount
export const mockSchools = (): SchoolStat[] => {
  return [
    {
      id: "school1",
      name: "135 nömrəli məktəb",
      completionRate: 85,
      pendingCount: 3
    },
    {
      id: "school2",
      name: "67 nömrəli məktəb",
      completionRate: 72,
      pendingCount: 7
    },
    {
      id: "school3",
      name: "189 nömrəli məktəb",
      completionRate: 68,
      pendingCount: 5
    }
  ] as unknown as SchoolStat[];
};

// Mock data for pending approvals with type casting to handle count
export const mockPendingApprovals = (): PendingApproval[] => {
  return [
    {
      id: "pa1",
      schoolId: "school1",
      schoolName: "135 nömrəli məktəb",
      categoryId: "cat1",
      categoryName: "Ümumi məlumatlar",
      status: "pending",
      createdAt: new Date().toISOString(),
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      count: 3
    },
    {
      id: "pa2",
      schoolId: "school2",
      schoolName: "67 nömrəli məktəb",
      categoryId: "cat2",
      categoryName: "Müəllim statistikası",
      status: "pending",
      createdAt: new Date().toISOString(),
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      count: 1
    }
  ] as unknown as PendingApproval[];
};

// Mock data for categories
export const mockCategories = (): Category[] => {
  return [
    {
      id: "cat1",
      name: "Ümumi məlumatlar",
      description: "Məktəbin ümumi məlumatları",
      status: "active" as const,
      assignment: "all" as const,
      completionRate: 85
    },
    {
      id: "cat2",
      name: "Müəllim statistikası",
      description: "Müəllimlərlə bağlı statistik məlumatlar",
      status: "active" as const,
      assignment: "all" as const,
      completionRate: 62
    },
    {
      id: "cat3",
      name: "Şagird statistikası",
      description: "Şagirdlərlə bağlı statistik məlumatlar",
      status: "pending" as const,
      assignment: "schools" as const,
      completionRate: 45
    }
  ];
};

// Mock dashboard notifications
export const mockNotifications = () => {
  return [
    {
      id: "n1",
      title: "Yeni məktəb əlavə edildi",
      message: "67 nömrəli məktəb sistemə əlavə edildi",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: "info",
      isRead: false
    },
    {
      id: "n2",
      title: "Hesabat təsdiqləndi",
      message: "Ümumi məlumatlar hesabatı təsdiqləndi",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: "success",
      isRead: true
    }
  ];
};
