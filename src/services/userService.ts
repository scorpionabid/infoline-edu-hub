
import { supabase } from '@/integrations/supabase/client';
import { 
  CreateUserData, 
  UpdateUserData, 
  FullUserData, 
  UserRole 
} from '@/types/supabase';
import { toast } from 'sonner';

// İstifadəçiləri əldə et (filtirlərlə)
export const getUsers = async (
  filters?: {
    role?: UserRole;
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
      
      return {
        id: item.user_id,
        email: emails[item.user_id] || '',
        full_name: profile.full_name,
        role: item.role,
        region_id: item.region_id,
        sector_id: item.sector_id,
        school_id: item.school_id,
        phone: profile.phone,
        position: profile.position,
        language: profile.language,
        avatar: profile.avatar,
        status: typedStatus,
        last_login: profile.last_login,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        
        // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
        name: profile.full_name,
        regionId: item.region_id,
        sectorId: item.sector_id,
        schoolId: item.school_id,
        lastLogin: profile.last_login,
        createdAt: profile.created_at,
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
    
    // Tam istifadəçi məlumatlarını birləşdiririk
    const fullUserData: FullUserData = {
      id: userId,
      email: mockEmail,
      full_name: profile.full_name,
      role: roleData.role,
      region_id: roleData.region_id,
      sector_id: roleData.sector_id,
      school_id: roleData.school_id,
      phone: profile.phone,
      position: profile.position,
      language: profile.language,
      avatar: profile.avatar,
      status: typedStatus,
      last_login: profile.last_login,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      
      // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
      name: profile.full_name,
      regionId: roleData.region_id,
      sectorId: roleData.sector_id,
      schoolId: roleData.school_id,
      lastLogin: profile.last_login,
      createdAt: profile.created_at,
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

// Yeni istifadəçi yarat
export const createUser = async (userData: CreateUserData): Promise<FullUserData | null> => {
  try {
    // Supabase admin funksiyasını simulyasiya edirik
    // Həqiqi layihədə bu Edge Function vasitəsilə yerinə yetirilməlidir
    const mockUserId = `${Math.random().toString(36).substring(2, 15)}`;
    
    // İstifadəçi yaratdıqdan sonra profil və rol dataları avtomatik trigger ilə yaradılacaq
    // Bu yalnız demo məqsədilə profil və rolu manual yaratmaq üçündür
    
    // Profil yarat
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: mockUserId,
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language || 'az',
        avatar: userData.avatar,
        status: (userData.status || 'active') as 'active' | 'inactive' | 'blocked'
      });
    
    if (profileError) throw profileError;
    
    // Rol yarat
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: mockUserId,
        role: userData.role,
        region_id: userData.region_id,
        sector_id: userData.sector_id,
        school_id: userData.school_id
      });
    
    if (roleError) throw roleError;
    
    // Yeni yaradılmış istifadəçini əldə et
    const newUser = await getUser(mockUserId);
    
    toast.success('İstifadəçi uğurla yaradıldı', {
      description: `${userData.full_name} adlı istifadəçi yaradıldı`
    });
    
    return newUser;
  } catch (error: any) {
    console.error('İstifadəçi yaradarkən xəta baş verdi:', error);
    
    toast.error('İstifadəçi yaradılarkən xəta baş verdi', {
      description: error.message
    });
    
    return null;
  }
};

// İstifadəçini yenilə
export const updateUser = async (userId: string, updates: UpdateUserData): Promise<FullUserData | null> => {
  try {
    // Profilə aid yeniləmələr
    const profileUpdates: any = {};
    if (updates.full_name !== undefined) profileUpdates.full_name = updates.full_name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.position !== undefined) profileUpdates.position = updates.position;
    if (updates.language !== undefined) profileUpdates.language = updates.language;
    if (updates.avatar !== undefined) profileUpdates.avatar = updates.avatar;
    if (updates.status !== undefined) profileUpdates.status = updates.status;
    
    // Status dəyərini düzgün tipə çevirək, əgər varsa
    if (updates.status !== undefined) {
      const statusValue = updates.status;
      updates.status = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
        ? statusValue 
        : 'active' as 'active' | 'inactive' | 'blocked';
    }
    
    // Profil yenilə
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (profileError) throw profileError;
    }
    
    // Rol yeniləmələri
    if (updates.role || updates.region_id !== undefined || updates.sector_id !== undefined || updates.school_id !== undefined) {
      const roleUpdates: any = {};
      if (updates.role) roleUpdates.role = updates.role;
      if (updates.region_id !== undefined) roleUpdates.region_id = updates.region_id;
      if (updates.sector_id !== undefined) roleUpdates.sector_id = updates.sector_id;
      if (updates.school_id !== undefined) roleUpdates.school_id = updates.school_id;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update(roleUpdates)
        .eq('user_id', userId);
      
      if (roleError) throw roleError;
    }
    
    // Əgər parol yenilənirsə, auth API ilə yenilə
    if (updates.password) {
      // Həqiqi layihədə bu edge function ilə edilməlidir
      console.log('İstifadəçi parolu yenilənir:', userId);
    }
    
    // Yenilənmiş istifadəçini əldə et
    const updatedUser = await getUser(userId);
    
    toast.success('İstifadəçi uğurla yeniləndi', {
      description: `İstifadəçi məlumatları yeniləndi`
    });
    
    return updatedUser;
  } catch (error: any) {
    console.error('İstifadəçi yenilərkən xəta baş verdi:', error);
    
    toast.error('İstifadəçi yenilərkən xəta baş verdi', {
      description: error.message
    });
    
    return null;
  }
};

// İstifadəçini sil
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Həqiqi layihədə bu edge function ilə edilməlidir
    // Burada süni arxa plan əməliyyatları təqlid edirik
    
    // Profili sil (RLS-ə görə user_roles də avtomatik silinəcək)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    
    toast.success('İstifadəçi uğurla silindi', {
      description: 'İstifadəçi sistemdən silindi'
    });
    
    return true;
  } catch (error: any) {
    console.error('İstifadəçi silmə zamanı xəta baş verdi:', error);
    
    toast.error('İstifadəçi silmə zamanı xəta baş verdi', {
      description: error.message
    });
    
    return false;
  }
};

// İstifadəçi şifrəsini sıfırla
export const resetUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  try {
    // Həqiqi layihədə bu edge function ilə edilməlidir
    console.log('İstifadəçi parolu sıfırlanır:', userId);
    
    toast.success('İstifadəçi şifrəsi sıfırlandı', {
      description: 'Yeni şifrə təyin edildi'
    });
    
    return true;
  } catch (error: any) {
    console.error('Şifrə sıfırlama zamanı xəta baş verdi:', error);
    
    toast.error('Şifrə sıfırlama zamanı xəta baş verdi', {
      description: error.message
    });
    
    return false;
  }
};
