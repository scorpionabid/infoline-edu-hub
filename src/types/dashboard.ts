
// Bu fayl standart interfeyslər üçündür
import { FormItem } from "./form";
import { Notification } from "./notification";

// Bu interfeys artıq dashboard.d.ts faylında təyin olunduğundan, 
// burada daha sadə bir tap yaratmaqla və əsas tiplərə yönləndirməklə köhnə kodları qoruyuruq
export { 
  DashboardSummary,
  ActivityItem,
  RegionStats,
  SectorStats,
  SchoolStats,
  RecentForm,
  DashboardData,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardNotification,
  UINotification,
  PendingApprovalItem,
  SchoolStat,
  FormItem,
  ChartData,
  CategoryStat
} from './dashboard.d';
