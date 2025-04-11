
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/supabase';
import { PermissionLevel } from './types';
import { UserRoleData } from './types';

/**
 * Region səviyyəsində icazəni yoxlayır
 * @param regionId - Yoxlanılacaq region ID-si
 * @param level - Tələb olunan icazə səviyyəsi (read, write, full)
 * @returns İcazənin olub-olmadığı
 */
export const checkRegionAccess = async (
  regionId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  if (!regionId) return false;
  
  try {
    const { data: userRoleData, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', supabase.auth.getUser().data.user?.id) // currentUser yerine getUser kullanılıyor
      .single();
    
    if (error) {
      console.error('Region icazəsi yoxlanarkən xəta:', error);
      return false;
    }
    
    if (!userRoleData) {
      return false;
    }
    
    const userRole: UserRole = userRoleData.role;
    
    switch (userRole) {
      case 'superadmin':
        return true;
      case 'regionadmin':
        return userRoleData.region_id === regionId;
      default:
        return false;
    }
  } catch (error) {
    console.error('Region icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * Sektor səviyyəsində icazəni yoxlayır
 * @param sectorId - Yoxlanılacaq sektor ID-si
 * @param level - Tələb olunan icazə səviyyəsi (read, write, full)
 * @returns İcazənin olub-olmadığı
 */
export const checkSectorAccess = async (
  sectorId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  if (!sectorId) return false;
  
  try {
    const { data: userRoleData, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', supabase.auth.getUser().data.user?.id) // currentUser yerine getUser kullanılıyor
      .single();
    
    if (error) {
      console.error('Sektor icazəsi yoxlanarkən xəta:', error);
      return false;
    }
    
    if (!userRoleData) {
      return false;
    }
    
    const userRole: UserRole = userRoleData.role;
    
    switch (userRole) {
      case 'superadmin':
        return true;
      case 'sectoradmin':
        return userRoleData.sector_id === sectorId;
      default:
        return false;
    }
  } catch (error) {
    console.error('Sektor icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * Məktəb səviyyəsində icazəni yoxlayır
 * @param schoolId - Yoxlanılacaq məktəb ID-si
 * @param level - Tələb olunan icazə səviyyəsi (read, write, full)
 * @returns İcazənin olub-olmadığı
 */
export const checkSchoolAccess = async (
  schoolId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  if (!schoolId) return false;
  
  try {
    const { data: userRoleData, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', supabase.auth.getUser().data.user?.id) // currentUser yerine getUser kullanılıyor
      .single();
    
    if (error) {
      console.error('Məktəb icazəsi yoxlanarkən xəta:', error);
      return false;
    }
    
    if (!userRoleData) {
      return false;
    }
    
    const userRole: UserRole = userRoleData.role;
    
    switch (userRole) {
      case 'superadmin':
        return true;
      case 'schooladmin':
        return userRoleData.school_id === schoolId;
      default:
        return false;
    }
  } catch (error) {
    console.error('Məktəb icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * Kateqoriya səviyyəsində icazəni yoxlayır
 * Hər kəs oxuya bilər, yalnız superadmin və ya regionadmin yaza bilər
 * @param categoryId - Yoxlanılacaq kateqoriya ID-si
 * @param level - Tələb olunan icazə səviyyəsi (read, write, full)
 * @returns İcazənin olub-olmadığı
 */
export const checkCategoryAccess = async (
  categoryId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  try {
    const { data: userRoleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabase.auth.getUser().data.user?.id) // currentUser yerine getUser kullanılıyor
      .single();
    
    if (error) {
      console.error('Kateqoriya icazəsi yoxlanarkən xəta:', error);
      return false;
    }
    
    if (!userRoleData) {
      return false;
    }
    
    const userRole: UserRole = userRoleData.role;
    
    if (level === 'read') {
      return true; // Hər kəs oxuya bilər
    }
    
    // Yalnız superadmin və ya regionadmin yaza bilər
    return userRole === 'superadmin' || userRole === 'regionadmin';
  } catch (error) {
    console.error('Kateqoriya icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * Sütun səviyyəsində icazəni yoxlayır
 * Hər kəs oxuya bilər, yalnız superadmin və ya regionadmin yaza bilər
 * @param columnId - Yoxlanılacaq sütun ID-si
 * @param level - Tələb olunan icazə səviyyəsi (read, write, full)
 * @returns İcazənin olub-olmadığı
 */
export const checkColumnAccess = async (
  columnId: string,
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  try {
    const { data: userRoleData, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabase.auth.getUser().data.user?.id) // currentUser yerine getUser kullanılıyor
      .single();
    
    if (error) {
      console.error('Sütun icazəsi yoxlanarkən xəta:', error);
      return false;
    }
    
    if (!userRoleData) {
      return false;
    }
    
    const userRole: UserRole = userRoleData.role;
    
    if (level === 'read') {
      return true; // Hər kəs oxuya bilər
    }
    
    // Yalnız superadmin və ya regionadmin yaza bilər
    return userRole === 'superadmin' || userRole === 'regionadmin';
  } catch (error) {
    console.error('Sütun icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};

/**
 * Sektor adminin kateqoriya və sütunlara daxil olub-olmadığını yoxlayır
 * @returns İcazənin olub-olmadığı
 */
export const canSectorAdminAccessCategoriesColumns = (): boolean => {
  try {
    const user = supabase.auth.getUser().data.user;
    const userRole = user?.app_metadata?.role as UserRole;
    return userRole === 'superadmin' || userRole === 'regionadmin';
  } catch (error) {
    console.error('Sektor admin icazəsi yoxlanarkən xəta:', error);
    return false;
  }
};
