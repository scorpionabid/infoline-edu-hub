import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockSchools } from '@/data/schoolsData';
import { mockCategories } from '@/data/mockCategories';
import { Notification } from '@/components/dashboard/NotificationsCard';
import { FormStatus } from '@/types/form';

// SuperAdmin üçün data interfeysi
export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  statusData?: {
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  };
  notifications: Notification[];
  activityData?: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }>;
}

// Region admin üçün data interfeysi
export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  categories: {
    name: string;
    completionRate: number;
    color: string;
  }[];
  sectorCompletions: {
    name: string;
    completionRate: number;
  }[];
}

// Sektor admin üçün data interfeysi
export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
}

// Məktəb admin üçün data interfeysi
export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  categories?: number;
  totalForms?: number;
  completedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<{
    id: string;
    title: string;
    category: string;
    status: FormStatus;
    completionPercentage: number;
    deadline?: string;
  }>;
}

// Müxtəlif rollara uyğun mock data yaratmaq üçün funksiya
const getMockDashboardData = (role: string | undefined) => {
  switch (role) {
    case 'superadmin':
      return getSuperAdminData();
    case 'regionadmin':
      return getRegionAdminData();
    case 'sectoradmin':
      return getSectorAdminData();
    case 'schooladmin':
      return getSchoolAdminData();
    default:
      return {};
  }
};

// SuperAdmin üçün mock data
const getSuperAdminData = (): SuperAdminDashboardData => {
  return {
    regions: 10,
    sectors: 45,
    schools: 596,
    users: 684,
    completionRate: 78,
    pendingApprovals: 23,
    pendingSchools: 65,
    approvedSchools: 452,
    rejectedSchools: 12,
    statusData: {
      completed: 452,
      pending: 65,
      rejected: 12,
      notStarted: 67,
    },
    notifications: [
      { id: 1, type: "info", title: "Yeni hesabatlar", message: "24 yeni hesabat əlavə edilib", time: "2 saat əvvəl" },
      { id: 2, type: "warning", title: "Son tarix yaxınlaşır", message: "Müəllim məlumatları üçün son tarix yaxınlaşır", time: "5 saat əvvəl" },
      { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "Məktəb məlumatları 3 region üçün təsdiqləndi", time: "dünən" },
    ],
    activityData: [
      { id: "a1", action: "İstifadəçi yaradıldı", actor: "Əhməd Məmmədov", target: "Leyla Əliyeva (Region 4 Admin)", time: "1 saat əvvəl" },
      { id: "a2", action: "Kateqoriya yaradıldı", actor: "Cavid Hüseynov", target: "İnfrastruktur məlumatları", time: "3 saat əvvəl" },
      { id: "a3", action: "Məlumatlar təsdiqləndi", actor: "Samirə Qasımova", target: "Bakı şəhəri, 28 məktəb", time: "4 saat əvvəl" },
      { id: "a4", action: "Hesabat yaradıldı", actor: "Orxan Nəsibov", target: "Bölgə üzrə şagird sayı hesabatı", time: "dünən" },
    ]
  };
};

// Region Admin üçün mock data
const getRegionAdminData = (): RegionAdminDashboardData => {
  return {
    sectors: 12,
    schools: 167,
    users: 185,
    completionRate: 72,
    pendingApprovals: 18,
    pendingSchools: 28,
    approvedSchools: 124,
    rejectedSchools: 8,
    notifications: [
      { id: 1, type: "info", title: "Yeni məlumatlar", message: "15 məktəb üçün yeni məlumatlar daxil edilib", time: "3 saat əvvəl" },
      { id: 2, type: "warning", title: "Təsdiq gözləyən məlumatlar", message: "8 məktəb üçün məlumatlar təsdiqlənməlidir", time: "5 saat əvvəl" },
      { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "12 məktəb üçün məlumatlar təsdiqləndi", time: "dünən" },
    ],
    // Category completion data
    categories: [
      { name: "Tədris məlumatları", completionRate: 82, color: "bg-blue-500" },
      { name: "Müəllim məlumatları", completionRate: 67, color: "bg-green-500" },
      { name: "İnfrastruktur məlumatları", completionRate: 45, color: "bg-amber-500" },
      { name: "Maliyyə məlumatları", completionRate: 34, color: "bg-purple-500" },
    ],
    // Sector completion data
    sectorCompletions: [
      { name: "Sektor 1", completionRate: 92 },
      { name: "Sektor 2", completionRate: 78 },
      { name: "Sektor 3", completionRate: 63 },
      { name: "Sektor 4", completionRate: 45 },
      { name: "Sektor 5", completionRate: 29 },
    ]
  };
};

// Sektor Admin üçün mock data
const getSectorAdminData = (): SectorAdminDashboardData => {
  return {
    schools: 34,
    completionRate: 68,
    pendingApprovals: 12,
    pendingSchools: 15,
    approvedSchools: 16,
    rejectedSchools: 3,
    notifications: [
      { id: 1, type: "info", title: "Yeni məlumatlar", message: "5 məktəb üçün yeni məlumatlar daxil edilib", time: "1 saat əvvəl" },
      { id: 2, type: "warning", title: "Təsdiq gözləyən məlumatlar", message: "12 məktəb üçün məlumatlar təsdiqlənməlidir", time: "3 saat əvvəl" },
      { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "4 məktəb üçün məlumatlar təsdiqləndi", time: "dünən" },
    ]
  };
};

// Məktəb Admin üçün mock data
const getSchoolAdminData = (): SchoolAdminDashboardData => {
  // mockCategories üzərindən kateqoriya məlumatlarını əldə edirik
  const categoryCount = mockCategories.length;
  const totalFormsCount = mockCategories.reduce((total, cat) => total + cat.columns.length, 0);
  
  // Təsdiqlənmiş, gözləmədə və rədd edilmiş formların sayını hesablayırıq
  const completedFormsCount = Math.floor(totalFormsCount * 0.45); // 45% tamamlanmış
  const pendingFormsCount = Math.floor(totalFormsCount * 0.35);  // 35% gözləmədə
  const rejectedFormsCount = Math.floor(totalFormsCount * 0.20); // 20% rədd edilmiş
  
  // Son tarixlər üçün kateqoriya məlumatlarından istifadə edirik
  const dueDates = mockCategories
    .filter(cat => cat.deadline)
    .map(cat => ({
      category: cat.name,
      date: cat.deadline || new Date().toISOString()
    }));
  
  // Son formalar üçün MockCategories-dəki mövcud kateqoriyalardan və onların sütunlarından istifadə edirik
  const recentForms = mockCategories.flatMap(category => 
    category.columns.slice(0, 2).map((column, idx) => ({
      id: `${category.id}-${column.id}`,
      title: column.name,
      category: category.name,
      status: idx % 4 === 0 ? "pending" as FormStatus : 
              idx % 4 === 1 ? "approved" as FormStatus : 
              idx % 4 === 2 ? "rejected" as FormStatus : "draft" as FormStatus,
      completionPercentage: idx % 4 === 1 ? 100 : Math.floor(Math.random() * 80) + 20,
      deadline: category.deadline
    }))
  ).slice(0, 8);
  
  return {
    completionRate: 57,
    forms: {
      pending: pendingFormsCount,
      approved: completedFormsCount,
      rejected: rejectedFormsCount,
      dueSoon: 3,
      overdue: 1
    },
    notifications: [
      { id: 1, type: "warning", title: "Son tarix yaxınlaşır", message: "Tədris məlumatları üçün son tarix yaxınlaşır", time: "2 saat əvvəl" },
      { id: 2, type: "error", title: "Məlumatlar rədd edildi", message: "Müəllim məlumatları düzəlişlər tələb edir", time: "dünən" },
      { id: 3, type: "success", title: "Məlumatlar təsdiqləndi", message: "İnfrastruktur məlumatları təsdiqləndi", time: "2 gün əvvəl" },
    ],
    categories: categoryCount,
    totalForms: totalFormsCount, 
    completedForms: completedFormsCount,
    pendingForms: pendingFormsCount,
    rejectedForms: rejectedFormsCount,
    dueDates: dueDates,
    recentForms: recentForms
  };
};

// Chart data-ları - ümumi istifadə üçün
export const getChartData = () => {
  const activityData = [
    { name: 'Yan', value: 20 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'İyn', value: 43 },
    { name: 'İyl', value: 50 },
  ];
  
  const regionSchoolsData = [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
  
  const categoryCompletionData = [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
  ];

  return {
    activityData,
    regionSchoolsData,
    categoryCompletionData
  };
};

// Dashboard data hook
export const useDashboardData = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({});
  const chartData = getChartData();
  
  // Səhifəni yükləmə simulyasiyası
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardData(getMockDashboardData(user?.role));
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user?.role]);

  return {
    isLoading,
    dashboardData,
    chartData,
    userRole: user?.role
  };
};
