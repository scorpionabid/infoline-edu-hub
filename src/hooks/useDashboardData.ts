
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateDashboardDataByRole, 
  generateMockChartData 
} from '@/utils/dashboardUtils';
import { Notification } from '@/types/notification';

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
  message?: string;
  time?: string;
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
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  activityData?: {
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  stats?: StatsItem[];
  recentForms?: FormItem[];
  topSchools?: {
    id: string;
    name: string;
    completionPercentage: number;
    region?: string;
  }[];
}

// RegionAdmin dashboard data
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
  categories?: CategoryCompletion[];
  sectorCompletions?: SectorCompletion[];
  stats?: StatsItem[];
  recentForms?: FormItem[];
}

// SectorAdmin dashboard data
export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  stats?: StatsItem[];
  recentForms?: FormItem[];
  schoolList?: {
    id: string;
    name: string;
    completionPercentage: number;
  }[];
}

// SchoolAdmin dashboard data
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
  pendingForms?: any[];
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<{
    id: string;
    title: string;
    category: string;
    status: string;
    completionPercentage: number;
    deadline?: string;
  }>;
  stats?: StatsItem[];
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
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Dashboard məlumatları alınır...');
        
        // Təxminən API çağırışını simulyasiya etmək üçün gecikmə
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // İstifadəçi roluna əsasən mock data generasiya etmək
        const role = user?.role || 'schooladmin'; // Default rol təyin edirik
        console.log(`Dashboard yüklənir: ${role} rolu üçün`);
        
        // Mock data generasiya etmək
        const mockData = generateDashboardDataByRole(role);
        setDashboardData(mockData);
        
        // Qrafik datanı generasiya etmək
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
    
    // Auth yükləməsi bitdikdə dashboard məlumatlarını əldə et
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);
  
  return { dashboardData, isLoading, error, chartData, userRole: user?.role };
};
