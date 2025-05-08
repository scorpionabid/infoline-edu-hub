
import { 
  CompletionData,
  DashboardStatus, 
  FormStats,
  SchoolCompletionData,
  CategoryItem,
  CompletionData as CompletionStats,
  DashboardNotification
} from '@/types/dashboard';
import { Sector } from '@/types/user';

type SectorCompletionItem = Sector & { completionRate: number };

// Nümunə verilənlər
export const dashboardStats: DashboardStatus = {
  pending: 247,
  approved: 1256,
  rejected: 64,
  draft: 85,
  total: 1652,
  active: 410,
  inactive: 22
};
