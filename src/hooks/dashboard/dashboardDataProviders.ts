
import { MockCategory } from '@/types/category';
import { 
  DashboardData, 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  FormItem
} from '@/types/dashboard';

// Yeni refactored providerlərimizi ixrac edirik
export {
  getBaseData,
  getSuperAdminData,
  getRegionAdminData, 
  getSectorAdminData,
  getSchoolAdminData,
  createSafeFormItems,
  transformDeadlineToString
} from './providers';
