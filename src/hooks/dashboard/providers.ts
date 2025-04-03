
import { User } from "@/types/user";
import { Category } from '@/types/category';
import { School } from '@/types/school';
import { DashboardData, FormItem } from '@/types/dashboard';

export const getBaseData = async (user: User) => {
  // Əsas məlumatları burada yüklə
  return {
    userId: user.id,
    userName: user.full_name || user.email,
    isLoading: false,
    error: null
  };
};

export const createSafeFormItems = (forms: any[]): FormItem[] => {
  if (!forms || !Array.isArray(forms)) {
    return [];
  }

  return forms.map(form => {
    return {
      id: form.id || `form-${Math.random().toString(36).substring(7)}`,
      title: form.title || "Untitled Form",
      status: form.status || "pending",
      completionPercentage: form.completionPercentage || Math.floor(Math.random() * 100),
      deadline: form.deadline || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    };
  });
};

export const transformDeadlineToString = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  } catch (e) {
    console.error('Invalid date format', e);
    return '';
  }
};

export const getSuperAdminData = async () => {
  return {
    // SuperAdmin məlumatları
  };
};

export const getRegionAdminData = async () => {
  return {
    // Region admin məlumatları
    approvalRate: 85, // Add approvalRate for RegionAdminDashboard
  };
};

export const getSectorAdminData = async () => {
  return {
    // Sektor admin məlumatları
  };
};

export const getSchoolAdminData = async () => {
  return {
    // Məktəb admin məlumatları
    pendingForms: 5, // Add pendingForms for SchoolAdminDashboard
  };
};
