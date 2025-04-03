
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { UserFetchFilters, UserPagination, UsersResponse } from './types';

// İstifadəçiləri əldə et (filtirlərlə)
export const getUsers = async (
  filters?: UserFetchFilters,
  pagination?: UserPagination
): Promise<UsersResponse> => {
  try {
    let query = supabase
      .from('user_roles')
      .select(`
        *,
        profiles:profiles(*)
      `, { count: 'exact' });
    
    // Filtrləri tətbiq et
    if (filters) {
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      
      if (filters.region_id) {
        query = query.eq('region_id', filters.region_id);
      }
      
      if (filters.sector_id) {
        query = query.eq('sector_id', filters.sector_id);
      }
      
      if (filters.school_id) {
        query = query.eq('school_id', filters.school_id);
      }
      
      if (filters.status) {
        query = query.eq('profiles.status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`profiles.full_name.ilike.%${filters.search}%,profiles.email.ilike.%${filters.search}%`);
      }
    }
    
    // Pagination
    if (pagination) {
      const { page, pageSize } = pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query.range(from, to);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Auth API ilə e-poçt məlumatlarını əldə etmək
    const userIds = data.map(item => item.user_id);
    
    // İstifadəçiləri əldə etmək üçün admin_getUserById çağırışı - bu sadəcə demo üçündür
    // Həqiqi layihədə server tərəfdə adminlar üçün bir edge function olmalıdır
    const emails: Record<string, string> = {};
    
    // Mock data üçün e-poçtları təyin edirik
    for (const userId of userIds) {
      const mockEmail = `user-${userId.substring(0, 6)}@infoline.edu`;
      emails[userId] = mockEmail;
    }
    
    // Default profil məlumatları
    const defaultProfile = {
      full_name: '',
      avatar: null,
      phone: null,
      position: null,
      language: 'az',
      last_login: null,
      status: 'active' as 'active' | 'inactive' | 'blocked',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Tam istifadəçi məlumatlarını birləşdiririk
    const formattedUsers: FullUserData[] = data.map(item => {
      // Supabase-dən gələn profil məlumatları
      // Burada profiles bir obyekt olmalıdır, əgər deyilsə, boş bir obyekt istifadə edirik
      const profileData = item.profiles && typeof item.profiles === 'object' ? item.profiles : {};
      
      // Profil məlumatlarını defaultProfile ilə birləşdiririk
      const profile = {
        ...defaultProfile,
        ...profileData
      };
      
      // Status dəyərini düzgün tipə çevirək
      const statusValue = profile.status || 'active';
      const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
        ? statusValue as 'active' | 'inactive' | 'blocked'
        : 'active' as 'active' | 'inactive' | 'blocked';
      
      // UserRole tipləməsini düzəltmək
      const roleValue = item.role as string;
      const typedRole = ((roleValue === 'superadmin' || roleValue === 'regionadmin' || 
                         roleValue === 'sectoradmin' || roleValue === 'schooladmin') 
                         ? roleValue : 'schooladmin') as UserRole;
      
      // Tam istifadəçi məlumatlarını yaradırıq
      return {
        id: item.user_id,
        email: emails[item.user_id] || '',
        full_name: profile.full_name,
        name: profile.full_name, // name = full_name
        role: typedRole,
        region_id: item.region_id,
        regionId: item.region_id,
        sector_id: item.sector_id,
        sectorId: item.sector_id,
        school_id: item.school_id,
        schoolId: item.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: typedStatus,
        last_login: profile.last_login,
        lastLogin: profile.last_login,
        created_at: profile.created_at,
        createdAt: profile.created_at,
        updated_at: profile.updated_at,
        updatedAt: profile.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri
        twoFactorEnabled: false,
        notificationSettings: {
          email: true,
          system: true
        }
      };
    });
    
    return { 
      data: formattedUsers, 
      count: count || 0 
    };
  } catch (error: any) {
    console.error('İstifadəçiləri əldə edərkən xəta baş verdi:', error);
    throw new Error(`İstifadəçiləri əldə edərkən xəta: ${error.message}`);
  }
};

// İstifadəçini əldə et
export const getUser = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Rol məlumatlarını əldə et
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (roleError) throw roleError;
    
    // Profil məlumatlarını əldə et
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.warn('Profil məlumatlarını əldə edərkən xəta:', profileError);
      // Xəta olsa da davam edirik, amma boş profil məlumatları istifadə edirik
    }
    
    // Default profil məlumatları
    const profile = {
      full_name: '',
      avatar: null,
      phone: null,
      position: null,
      language: 'az',
      last_login: null,
      status: 'active' as 'active' | 'inactive' | 'blocked',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(profileData || {})
    };
    
    // Mock email - həqiqi layihədə server-side edge function ilə əldə ediləcək
    const mockEmail = `user-${userId.substring(0, 6)}@infoline.edu`;
    
    // Status dəyərini düzgün tipə çevirək
    const statusValue = profile.status || 'active';
    const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
      ? statusValue as 'active' | 'inactive' | 'blocked'
      : 'active' as 'active' | 'inactive' | 'blocked';
    
    // UserRole tipini düzəltmək
    const roleValue = roleData.role as string;
    const typedRole = ((roleValue === 'superadmin' || roleValue === 'regionadmin' || 
                       roleValue === 'sectoradmin' || roleValue === 'schooladmin') 
                       ? roleValue : 'schooladmin') as UserRole;
    
    // Tam istifadəçi məlumatlarını birləşdiririk
    const fullUserData: FullUserData = {
      id: userId,
      email: mockEmail,
      full_name: profile.full_name,
      name: profile.full_name,
      role: typedRole,
      region_id: roleData.region_id,
      regionId: roleData.region_id,
      sector_id: roleData.sector_id,
      sectorId: roleData.sector_id,
      school_id: roleData.school_id,
      schoolId: roleData.school_id,
      phone: profile.phone,
      position: profile.position,
      language: profile.language,
      avatar: profile.avatar,
      status: typedStatus,
      last_login: profile.last_login,
      lastLogin: profile.last_login,
      created_at: profile.created_at,
      createdAt: profile.created_at,
      updated_at: profile.updated_at,
      updatedAt: profile.updated_at,
      
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
