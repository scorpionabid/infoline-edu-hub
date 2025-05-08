import { 
  CompletionData,
  DashboardStatus, 
  DashboardFormStats as FormStats,
  SchoolStat as SchoolCompletionItem,
  Category as DashboardCategory,
  CategoryItem as CategoryWithCompletion,
  CompletionData as CompletionStats,
  DashboardNotification
} from '@/types/dashboard';
import { Sector } from '@/types/supabase';

type SectorCompletionItem = Sector & { completionRate: number };

// Nümunə verilənlər
export const dashboardStats: DashboardStats = {
  schools: {
    total: 432,
    active: 410,
    inactive: 22
  },
  forms: {
    pending: 247,
    approved: 1256,
    rejected: 64,
    draft: 85,
    total: 1652
  },
  categories: {
    total: 12,
    active: 8,
    upcoming: 2,
    expired: 2
  },
  users: {
    total: 523,
    active: 492,
    pending: 31
  },
  regions: {
    total: 10,
    completed: 6,
    inProgress: 4
  },
  sectors: {
    total: 28,
    completed: 18,
    inProgress: 10
  }
};
