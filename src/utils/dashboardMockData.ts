import { SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from "@/types/dashboard";
import { generateRandomId } from "./helpers";

// Super Admin üçün demo data
export const generateSuperAdminDashboardData = (): SuperAdminDashboardData => {
  return {
    regions: {
      total: 12,
      active: 10,
      inactive: 2
    },
    sectors: {
      total: 45,
      active: 42,
      inactive: 3
    },
    schools: {
      total: 682,
      active: 650,
      inactive: 32
    },
    users: {
      total: 1250,
      active: 1150,
      inactive: 100,
      byRole: {
        superadmin: 3,
        regionadmin: 12,
        sectoradmin: 45,
        schooladmin: 682
      }
    },
    completionRate: 78,
    pendingApprovals: 24,
    notifications: [
      {
        id: generateRandomId(),
        title: "Yeni məktəb əlavə edildi",
        message: "45 nömrəli məktəb sistemə əlavə edildi",
        date: new Date().toISOString(),
        isRead: false,
        type: "info"
      },
      {
        id: generateRandomId(),
        title: "Yeni kateqoriya",
        message: "Təhsil Nazirliyi yeni kateqoriya yaratdı",
        date: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
        type: "success"
      },
      {
        id: generateRandomId(),
        title: "Təcili bildiriş",
        message: "Son tarixlər yeniləndi. Bütün məlumatlar 20 Aprel tarixinə qədər təqdim edilməlidir",
        date: new Date(Date.now() - 172800000).toISOString(),
        isRead: false,
        type: "warning"
      }
    ],
    statistics: {
      completionRate: 78,
      pendingForms: 86,
      totalSchools: 682
    }
  };
};

// Digər rollara da örnək məlumatlar
export const generateRegionAdminDashboardData = (): RegionAdminDashboardData => {
  return {
    regionName: "Bakı",
    sectors: {
      total: 12,
      active: 10,
      inactive: 2
    },
    schools: {
      total: 156,
      active: 152,
      inactive: 4 
    },
    users: {
      total: 180,
      active: 170,
      inactive: 10,
      byRole: {
        sectoradmin: 12,
        schooladmin: 156
      }
    },
    completionRate: 82,
    pendingApprovals: 14,
    notifications: [
      {
        id: generateRandomId(),
        title: "Yeni məktəb əlavə edildi",
        message: "156 nömrəli məktəb regionunuza əlavə edildi",
        date: new Date().toISOString(),
        isRead: false,
        type: "info"
      },
      {
        id: generateRandomId(),
        title: "Təcili bildiriş",
        message: "Sabunçu rayonu üzrə hesabat gözlənilir",
        date: new Date(Date.now() - 86400000).toISOString(),
        isRead: false,
        type: "warning"
      }
    ],
    statistics: {
      completionRate: 82,
      pendingForms: 23,
      totalSchools: 156
    }
  };
};

// Bu export olunmuş funksiya ümumi dashboard datası yaradır
export const generateDashboardDataByRole = (role: string): any => {
  switch (role.toLowerCase()) {
    case 'superadmin':
      return generateSuperAdminDashboardData();
    case 'regionadmin':
      return generateRegionAdminDashboardData();
    case 'sectoradmin':
      return generateSectorAdminDashboardData();
    case 'schooladmin':
    default:
      return generateSchoolAdminDashboardData();
  }
};

// Sektor admini üçün demo data
export function generateSectorAdminDashboardData(): SectorAdminDashboardData {
  return {
    sectorName: "Sabunçu",
    regionName: "Bakı",
    schools: {
      total: 24,
      active: 23,
      inactive: 1
    },
    users: {
      total: 28,
      active: 26,
      inactive: 2,
      byRole: {
        schooladmin: 24
      }
    },
    completionRate: 86,
    pendingApprovals: 5,
    notifications: [
      {
        id: generateRandomId(),
        title: "Yeni məlumat tələbi",
        message: "Müəllim heyəti haqqında məlumatları yeniləyin",
        date: new Date().toISOString(),
        isRead: false,
        type: "info"
      }
    ],
    statistics: {
      completionRate: 86,
      pendingForms: 5,
      totalSchools: 24
    }
  };
}

// Məktəb admini üçün demo data
export function generateSchoolAdminDashboardData(): SchoolAdminDashboardData {
  return {
    schoolName: "168 nömrəli tam orta məktəb",
    sectorName: "Sabunçu",
    regionName: "Bakı",
    completionRate: 92,
    forms: {
      total: 12,
      pending: 2,
      approved: 9,
      rejected: 1,
      dueSoon: 3,
      overdue: 0
    },
    pendingForms: [
      {
        id: generateRandomId(),
        title: "Müəllim kadrları",
        date: "2025-04-15",
        status: "pending"
      },
      {
        id: generateRandomId(),
        title: "Şagird sayı",
        date: "2025-04-20",
        status: "dueSoon"
      },
      {
        id: generateRandomId(),
        title: "Maddi-texniki baza",
        date: "2025-05-01",
        status: "dueSoon"
      }
    ],
    notifications: [
      {
        id: generateRandomId(),
        title: "Sənədlər təsdiqləndi",
        message: "Müəllim kadrları sənədi təsdiqləndi",
        date: new Date().toISOString(),
        isRead: false,
        type: "success"
      },
      {
        id: generateRandomId(),
        title: "Təcili bildiriş",
        message: "Şagird sayı ilə bağlı məlumatlar son tarixdən əvvəl təqdim edilməlidir",
        date: new Date(Date.now() - 86400000).toISOString(),
        isRead: false,
        type: "warning"
      }
    ]
  };
}

// Qrafiklər üçün demo data
export const generateMockChartData = () => {
  return {
    activityData: [
      { name: "Yanvar", value: 45 },
      { name: "Fevral", value: 62 },
      { name: "Mart", value: 78 },
      { name: "Aprel", value: 95 },
      { name: "May", value: 88 },
      { name: "İyun", value: 67 }
    ],
    regionSchoolsData: [
      { name: "Bakı", value: 156 },
      { name: "Gəncə", value: 57 },
      { name: "Sumqayıt", value: 43 },
      { name: "Şəki", value: 35 },
      { name: "Quba", value: 28 }
    ],
    categoryCompletionData: [
      { name: "Müəllim kadrları", value: 92 },
      { name: "Şagird sayı", value: 88 },
      { name: "Maddi-texniki baza", value: 76 },
      { name: "Kitabxana fondu", value: 82 },
      { name: "İnfrastruktur", value: 65 }
    ]
  };
};
