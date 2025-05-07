import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { fetchAdminEntityData, formatUserData } from './userUtilService';

// İstifadəçiləri əldə et (filtirlərlə)
export const getUsers = async (
  filters?: {
    role?: string;
    region_id?: string;
    sector_id?: string;
    school_id?: string;
    status?: string;
    search?: string;
  },
  pagination?: {
    page: number;
    pageSize: number;
  }
) => {
  try {
    // Bütün istifadəçiləri əldə et
    const { data: allUsers, error } = await supabase.rpc('get_full_user_data');
    
    if (error) throw error;
    
    let filteredUsers = allUsers || [];
    
    // Filtrləri tətbiq et
    if (filters) {
      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }
      
      if (filters.region_id) {
        filteredUsers = filteredUsers.filter(user => user.region_id === filters.region_id);
      }
      
      if (filters.sector_id) {
        filteredUsers = filteredUsers.filter(user => user.sector_id === filters.sector_id);
      }
      
      if (filters.school_id) {
        filteredUsers = filteredUsers.filter(user => user.school_id === filters.school_id);
      }
      
      if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          (user.full_name && user.full_name.toLowerCase().includes(searchLower)) || 
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower))
        );
      }
    }
    
    // Ümumi sayı saxlayaq
    const count = filteredUsers.length;
    
    // Pagination
    if (pagination) {
      const { page, pageSize } = pagination;
      const startIndex = (page - 1) * pageSize;
      filteredUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
    }
    
    // Formatlaşdırılmış istifadəçi məlumatlarını hazırlayaq
    const formattedUsers: FullUserData[] = filteredUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role as UserRole,
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id,
      phone: user.phone,
      position: user.user_position, // user_position kimi gəldiyi üçün position-a çeviririk
      language: user.language,
      avatar: user.avatar,
      status: user.status as 'active' | 'inactive' | 'blocked',
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
      name: user.full_name || '',
      regionId: user.region_id,
      sectorId: user.sector_id,
      schoolId: user.school_id,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    }));
    
    return { 
      data: formattedUsers, 
      count
    };
  } catch (error: any) {
    console.error('İstifadəçiləri əldə edərkən xəta baş verdi:', error);
    throw new Error(`İstifadəçiləri əldə edərkən xəta: ${error.message}`);
  }
};

// İstifadəçini əldə et
export const getUser = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Yeni yaratdığımız get_full_user_data(uuid) funksiyasını çağıraq
    const { data: userData, error } = await supabase.rpc('get_full_user_data', { 
      user_id_param: userId 
    });
    
    if (error) throw error;
    
    // Əgər məlumat yoxdursa
    if (!userData) return null;
    
    const user = userData as any;
    
    // Admin entity məlumatları (ehtiyac olmasa silinə bilər)
    const adminEntityData = await fetchAdminEntityData({
      role: user.role,
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id
    });
    
    // Tam istifadəçi məlumatlarını düzəlt
    const fullUserData: FullUserData = {
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role,
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id,
      phone: user.phone,
      position: user.position, // JSON daxilində artıq position kimi qayıdır
      language: user.language,
      avatar: user.avatar,
      status: user.status as 'active' | 'inactive' | 'blocked',
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
      name: user.full_name,
      regionId: user.region_id,
      sectorId: user.sector_id,
      schoolId: user.school_id,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      
      // Admin entitysi haqqında məlumatlar
      adminEntity: adminEntityData,
      
      // Əlavə tətbiq xüsusiyyətləri
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
    
    return fullUserData;
  } catch (error: any) {
    console.error('İstifadəçi məlumatlarını əldə edərkən xəta baş verdi:', error);
    return null;
  }
};
