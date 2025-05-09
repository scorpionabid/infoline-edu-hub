
import React from 'react';
import { useAuth } from '@/context/auth';
import SuperAdminDashboard from './SuperAdminDashboard';
import RegionAdminDashboard from './region-admin/RegionAdminDashboard'; 
import SectorAdminDashboard from './sector-admin/SectorAdminDashboard';
import { useNavigate } from 'react-router-dom';
import SchoolAdminDashboard from '@/components/dashboard/school-admin/SchoolAdminDashboard';
import { SchoolStat, PendingApproval, CategoryItem, DeadlineItem, FormItem } from '@/types/dashboard';
import { ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const mockSuperAdminData = () => ({
  completion: {
    percentage: 62,
    total: 120,
    completed: 74
  },
  status: {
    pending: 35,
    approved: 74,
    rejected: 11,
    total: 120,
    active: 85,
    inactive: 35
  },
  formStats: {
    pending: 35,
    approved: 74,
    rejected: 11,
    dueSoon: 15,
    overdue: 8,
    total: 120
  },
  upcomingDeadlines: [
    {
      id: "1",
      categoryId: "c1",
      categoryName: "Ümumi məlumatlar",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: "upcoming",
      completionRate: 65
    },
    {
      id: "2",
      categoryId: "c2",
      categoryName: "Maliyyə hesabatları",
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: "upcoming",
      completionRate: 30
    }
  ]
});

const mockRegionAdminData = () => ({
  completion: {
    percentage: 58,
    total: 85,
    completed: 49
  },
  status: {
    pending: 27,
    approved: 49,
    rejected: 9,
    total: 85,
    active: 65,
    inactive: 20
  },
  formStats: {
    pending: 27,
    approved: 49,
    rejected: 9,
    dueSoon: 12,
    overdue: 7,
    total: 85
  },
  upcomingDeadlines: [
    {
      id: "1",
      categoryId: "c1",
      categoryName: "Ümumi məlumatlar",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "upcoming",
      completionRate: 62
    },
    {
      id: "2",
      categoryId: "c2",
      categoryName: "Maliyyə hesabatları",
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      status: "upcoming",
      completionRate: 28
    }
  ]
});

const mockSectorAdminData = () => ({
  completion: {
    percentage: 65,
    total: 45,
    completed: 29
  },
  status: {
    pending: 14,
    approved: 29,
    rejected: 2,
    total: 45,
    active: 38,
    inactive: 7
  },
  formStats: {
    pending: 14,
    approved: 29,
    rejected: 2,
    dueSoon: 8,
    overdue: 5,
    total: 45
  },
  pendingApprovals: [
    {
      id: "pa1",
      schoolName: "135 nömrəli məktəb",
      categoryName: "Ümumi məlumatlar",
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      status: "pending"
    },
    {
      id: "pa2",
      schoolName: "67 nömrəli məktəb",
      categoryName: "Müəllim statistikası",
      submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "pending"
    }
  ] as PendingApproval[],
  schoolStats: [
    {
      id: "s1",
      name: "135 nömrəli məktəb",
      completionRate: 78,
      lastUpdate: new Date(Date.now() - 86400000).toISOString(),
      status: "active",
      pendingForms: 2,
      formsCompleted: 7,
      totalForms: 10,
      principalName: "Principal Name 1"
    },
    {
      id: "s2",
      name: "67 nömrəli məktəb",
      completionRate: 45,
      lastUpdate: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: "active",
      pendingForms: 4,
      formsCompleted: 4,
      totalForms: 10,
      principalName: "Principal Name 2"
    }
  ] as SchoolStat[],
  upcomingDeadlines: [
    {
      id: "1",
      categoryId: "c1",
      categoryName: "Ümumi məlumatlar",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: "upcoming",
      completionRate: 70
    }
  ] as DeadlineItem[]
});

const mockSchoolAdminData = () => {
  // Fix the categories to make sure they have completionRate
  const categories: CategoryItem[] = [
    {
      id: "c1",
      name: "Ümumi məlumatlar",
      description: "Məktəbin ümumi məlumatları",
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      completionRate: 70
    },
    {
      id: "c2",
      name: "Müəllim statistikası",
      description: "Müəllimlərlə bağlı statistik məlumatlar",
      deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
      completionRate: 30
    }
  ];
  
  // Create upcoming deadlines
  const upcoming: DeadlineItem[] = [
    {
      id: "d1",
      categoryId: "c1",
      categoryName: "Ümumi məlumatlar",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: "upcoming",
      completionRate: 70
    },
    {
      id: "d2",
      categoryId: "c2",
      categoryName: "Müəllim statistikası",
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: "pending",
      completionRate: 30
    },
    {
      id: "d3",
      categoryId: "c3",
      categoryName: "Şagird statistikası",
      dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "draft",
      completionRate: 0
    }
  ];
  
  const pendingForms: FormItem[] = [
    {
      id: "f1",
      categoryId: "c1",
      categoryName: "Ümumi məlumatlar",
      status: "pending",
      completionRate: 90,
      submittedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  return {
    completion: {
      percentage: 68,
      total: 10,
      completed: 7
    },
    completionRate: 68,
    status: {
      pending: 2,
      approved: 7,
      rejected: 1,
      draft: 3,
      total: 13,
      active: 10,
      inactive: 3
    },
    formStats: {
      pending: 2,
      approved: 7, 
      rejected: 1,
      draft: 3,
      dueSoon: 2,
      overdue: 1,
      total: 13
    },
    categories,
    upcoming,
    pendingForms,
    notifications: []
  };
};

const DashboardContent: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const navigateToDataEntry = () => {
    navigate('/data-entry');
  };
  
  const handleFormClick = (id: string) => {
    navigate(`/data-entry/${id}`);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Səhifəyə giriş üçün login olmalısınız</h2>
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Login səhifəsinə keç <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    );
  }
  
  switch (user.role) {
    case 'superadmin':
      return (
        <SuperAdminDashboard data={mockSuperAdminData()} />
      );
    case 'regionadmin':
      return (
        <RegionAdminDashboard 
          data={mockRegionAdminData()} 
          regionId={user.region_id || ''}
        />
      );
    case 'sectoradmin':
      return (
        <SectorAdminDashboard 
          data={mockSectorAdminData()} 
          sectorId={user.sector_id || ''}
        />
      );
    case 'schooladmin':
      return (
        <SchoolAdminDashboard 
          schoolId={user.school_id || ''}
          data={mockSchoolAdminData()}
        />
      );
    default:
      return (
        <div className="text-center py-10">
          <h2 className="text-xl font-medium">Rolunuza uyğun dashboard tapılmadı</h2>
          <p className="text-muted-foreground mt-2">Rol: {user.role}</p>
        </div>
      );
  }
};

export default DashboardContent;
