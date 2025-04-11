
import { supabase } from '@/integrations/supabase/client';

// Funksiya: Bütün istifadəçilərin sayını əldə et
export const getAllUsersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("İstifadəçi sayını əldə edərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("İstifadəçi sayını əldə edərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Bütün rolların sayını əldə et
export const getAllRolesCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Rol saylarını əldə edərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Rol saylarını əldə edərkən xəta:", error);
    return 0;
  }
};

// Supabase-də istifadəçilərin sayını əldə etmək için group əvəzinə ayrı-ayrı sorğular
export const getUsersCountByRole = async (): Promise<{ role: string; count: number }[]> => {
  try {
    const roles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    const result = [];
    
    for (const role of roles) {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);
      
      result.push({ role, count: count || 0 });
    }
    
    return result;
  } catch (error: any) {
    console.error("Rol üzrə istifadəçi sayını əldə edərkən xəta:", error);
    return [];
  }
};

// Funksiya: Son əlavə olunan istifadəçiləri əldə et
export const getLatestUsers = async (limit: number = 5): Promise<{ id: string; fullName: string; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Son istifadəçilər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      createdAt: item.created_at
    }));
  } catch (error: any) {
    console.error("Son istifadəçilər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Aylıq yeni istifadəçi sayını qrafik üçün əldə et
export const getMonthlyNewUsersForChart = async (): Promise<{ month: string; value: number }[]> => {
  try {
    const { data, error } = await supabase.from('profiles').select('created_at');

    if (error) {
      console.error("Aylıq yeni istifadəçi sayı əldə edilərkən xəta:", error);
      throw error;
    }

    // Aylıq istifadəçi sayını hesablamaq
    const monthlyCounts: { [key: string]: number } = {};
    data.forEach(user => {
      const date = new Date(user.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return Object.keys(monthlyCounts).map(month => ({
      month: month,
      value: monthlyCounts[month]
    }));
  } catch (error: any) {
    console.error("Aylıq yeni istifadəçi sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};
