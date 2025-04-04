
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateMockDashboardData, 
  generateMockChartData 
} from '@/utils/dashboardUtils';

// Form item interface
export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: string;
  completionPercentage: number;
  deadline?: string;
}

// StatsItem interface
export interface StatsItem {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

// Notification interface for dashboard
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  read?: boolean;
}

// Category completion interface
export interface CategoryCompletion {
  id: string;
  name: string;
  completionPercentage: number;
  deadline?: string;
  status: string;
}

// Sector completion interface
export interface SectorCompletion {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
}

// SuperAdmin dashboard data
export interface SuperAdminDashboardData {
  stats: StatsItem[];
  notifications: DashboardNotification[];
  recentForms: FormItem[];
  pendingApprovals: FormItem[];
  topSchools: {
    id: string;
    name: string;
    completionPercentage: number;
    region?: string;
  }[];
}

// RegionAdmin dashboard data
export interface RegionAdminDashboardData {
  stats: StatsItem[];
  notifications: DashboardNotification[];
  recentForms: FormItem[];
  pendingApprovals: FormItem[];
  sectorCompletions: SectorCompletion[];
  categories: CategoryCompletion[];
}

// SectorAdmin dashboard data
export interface SectorAdminDashboardData {
  stats: StatsItem[];
  notifications: DashboardNotification[];
  recentForms: FormItem[];
  pendingApprovals: FormItem[];
  schools: {
    id: string;
    name: string;
    completionPercentage: number;
  }[];
}

// SchoolAdmin dashboard data
export interface SchoolAdminDashboardData {
  stats: StatsItem[];
  notifications: DashboardNotification[];
  recentForms: FormItem[];
  pendingForms: FormItem[];
  completedCategories: CategoryCompletion[];
}

// Dashboard data union type
export type DashboardData = 
  | SuperAdminDashboardData
  | RegionAdminDashboardData
  | SectorAdminDashboardData
  | SchoolAdminDashboardData;

// Chart data interface
export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

export const useDashboardData = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Eğer kimlik doğrulama yükleniyor veya kullanıcı yoksa, işlem yapmıyoruz
    if (authLoading) {
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Dashboard məlumatları alınır...');
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock data based on user role
        if (!user) {
          throw new Error('İstifadəçi məlumatı yoxdur');
        }
        
        const role = user.role;
        console.log(`Dashboard yüklənir: ${role} rolu üçün`);
        
        // Generate mock data
        const mockData = generateMockDashboardData(role);
        setDashboardData(mockData);
        
        // Generate chart data
        const mockChartData = generateMockChartData();
        setChartData(mockChartData);
        
        console.log('Dashboard məlumatları uğurla alındı');
      } catch (err: any) {
        console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // İstifadəçi yüklənibsə, dashboard məlumatlarını əldə et
    if (!authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !user) {
      // Əgər istifadəçi yoxdursa, boş data göstər
      setDashboardData(null);
      setChartData(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);
  
  return { dashboardData, isLoading, error, chartData, userRole: user?.role };
};
