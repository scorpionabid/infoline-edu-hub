
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/auth';
import { toast } from 'sonner';

// Define UpdateUserData locally
export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  role?: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  password?: string;
}

// Mock audit log function - simplified
const addAuditLog = async (action: string, entityType: string, entityId: string, oldData: any, newData: any) => {
  console.log('Audit log:', { action, entityType, entityId, oldData, newData });
};

// Simple user fetch function
const getUser = async (userId: string): Promise<FullUserData | null> => {
  try {
    const [profileResult, roleResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_roles').select('*').eq('user_id', userId).single()
    ]);

    if (profileResult.error || roleResult.error) {
      console.error('Error fetching user:', profileResult.error || roleResult.error);
      return null;
    }

    const profile = profileResult.data;
    const role = roleResult.data;

    return {
      id: userId,
      email: profile.email || '',
      name: profile.full_name || '',
      full_name: profile.full_name || '',
      role: role.role || 'user',
      region_id: role.region_id,
      sector_id: role.sector_id,
      school_id: role.school_id,
      regionId: role.region_id,
      sectorId: role.sector_id,
      schoolId: role.school_id,
      avatar: profile.avatar || '',
      phone: profile.phone || '',
      position: profile.position || '',
      language: profile.language || 'az',
      status: profile.status || 'active',
      lastLogin: profile.last_login || null,
      last_login: profile.last_login || null,
      createdAt: profile.created_at || new Date().toISOString(),
      updatedAt: profile.updated_at || new Date().toISOString(),
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: profile.updated_at || new Date().toISOString(),
      notificationSettings: {
        email: true,
        system: true
      }
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
};

// İstifadəçini yenilə
export const updateUser = async (userId: string, updates: UpdateUserData): Promise<FullUserData | null> => {
  try {
    // Əvvəlki məlumatları əldə edək audit üçün
    const oldUser = await getUser(userId);
    
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
        .update({
          ...profileUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
    }
    
    // Rol yeniləmələri
    if (updates.role || updates.region_id !== undefined || updates.sector_id !== undefined || updates.school_id !== undefined) {
      const roleUpdates: any = {};
      if (updates.role) roleUpdates.role = updates.role as UserRole;
      if (updates.region_id !== undefined) roleUpdates.region_id = updates.region_id;
      if (updates.sector_id !== undefined) roleUpdates.sector_id = updates.sector_id;
      if (updates.school_id !== undefined) roleUpdates.school_id = updates.school_id;
      
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          ...roleUpdates,
          updated_at: new Date().toISOString()
        })
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
    
    // Audit log əlavə et
    await addAuditLog(
      'update',
      'user',
      userId,
      oldUser,
      updatedUser
    );
    
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
