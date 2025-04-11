
import { Notification } from '@/types/notification';
import { FormItem, SchoolAdminDashboardData } from '@/types/dashboard';

export interface UseSchoolAdminDashboardResult {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface RegionItem {
  id: string;
  name: string;
}

export interface SectorItem {
  id: string;
  name: string;
}
