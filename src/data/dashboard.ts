
import { 
  FormItem, 
  CategoryItem, 
  DeadlineItem, 
  PendingApproval, 
  SchoolStat, 
  SectorStat,
  DashboardFormStats,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  FormItemStatus,
  CategoryStatus,
  DeadlineStatus,
  EntityStatus
} from '@/types/dashboard';

// Mock data generators
export const generateMockForms = (count: number = 10): FormItem[] => {
  const statuses: FormItemStatus[] = ['pending', 'approved', 'rejected', 'completed', 'not_started', 'in_progress', 'overdue'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `form-${i + 1}`,
    name: `Form ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    completionRate: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

export const generateMockCategories = (count: number = 8): CategoryItem[] => {
  const statuses: CategoryStatus[] = ['active', 'inactive', 'pending', 'completed'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `category-${i + 1}`,
    name: `Category ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    completionRate: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

export const generateMockDeadlines = (count: number = 5): DeadlineItem[] => {
  const statuses: DeadlineStatus[] = ['upcoming', 'overdue', 'completed'];
  
  return Array.from({ length: count }, (_, i) => {
    const deadline = new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000);
    return {
      id: `deadline-${i + 1}`,
      name: `Deadline ${i + 1}`,
      deadline: deadline.toISOString(),
      dueDate: deadline.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      daysLeft: Math.floor(Math.random() * 30),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });
};

export const generateMockPendingApprovals = (count: number = 6): PendingApproval[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `pending-${i + 1}`,
    schoolName: `School ${i + 1}`,
    categoryName: `Category ${i + 1}`,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

export const generateMockSchoolStats = (count: number = 12): SchoolStat[] => {
  const statuses: EntityStatus[] = ['active', 'inactive', 'on_track', 'needs_attention'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `school-${i + 1}`,
    name: `School ${i + 1}`,
    completionRate: Math.floor(Math.random() * 100),
    totalForms: Math.floor(Math.random() * 20) + 5,
    completedForms: Math.floor(Math.random() * 15),
    pendingForms: Math.floor(Math.random() * 5),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

export const generateMockSectorStats = (count: number = 6): SectorStat[] => {
  const statuses: EntityStatus[] = ['active', 'inactive', 'on_track', 'needs_attention'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `sector-${i + 1}`,
    name: `Sector ${i + 1}`,
    schoolCount: Math.floor(Math.random() * 20) + 5,
    totalSchools: Math.floor(Math.random() * 25) + 10,
    activeSchools: Math.floor(Math.random() * 20) + 5,
    completionRate: Math.floor(Math.random() * 100),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// Dashboard data generators
export const generateSuperAdminDashboard = (): SuperAdminDashboardData => {
  return {
    stats: {
      completedForms: Math.floor(Math.random() * 50),
      pendingForms: Math.floor(Math.random() * 30),
      approvalRate: Math.floor(Math.random() * 100)
    },
    categories: generateMockCategories(8),
    deadlines: generateMockDeadlines(5),
    schools: {
      totalSchools: 150,
      activeSchools: 142,
      inactiveSchools: 8
    },
    sectors: {
      totalSectors: 12,
      activeSectors: 11,
      inactiveSectors: 1
    },
    regions: {
      totalRegions: 3,
      activeRegions: 3,
      inactiveRegions: 0
    }
  };
};

export const generateRegionAdminDashboard = (): RegionAdminDashboardData => {
  return {
    stats: {
      completedForms: Math.floor(Math.random() * 40),
      pendingForms: Math.floor(Math.random() * 25),
      approvalRate: Math.floor(Math.random() * 100)
    },
    categories: generateMockCategories(6),
    deadlines: generateMockDeadlines(4),
    sectors: generateMockSectorStats(6)
  };
};

export const generateSectorAdminDashboard = (): SectorAdminDashboardData => {
  return {
    stats: {
      completedForms: Math.floor(Math.random() * 30),
      pendingForms: Math.floor(Math.random() * 20),
      approvalRate: Math.floor(Math.random() * 100)
    },
    categories: generateMockCategories(5),
    deadlines: generateMockDeadlines(3),
    schools: generateMockSchoolStats(12)
  };
};

export const generateSchoolAdminDashboard = (): SchoolAdminDashboardData => {
  return {
    stats: {
      completedForms: Math.floor(Math.random() * 20),
      pendingForms: Math.floor(Math.random() * 15),
      approvalRate: Math.floor(Math.random() * 100)
    },
    categories: generateMockCategories(4),
    deadlines: generateMockDeadlines(2)
  };
};
