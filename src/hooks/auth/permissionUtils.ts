
import { PermissionLevel } from './types';
import { UserRole } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { UserRoleData } from './types';

/**
 * Verilmiş sorğunun nəticəsini yoxlayır və hər hansı xəta varsa konsola yazır
 * @param queryPromise - Supabase sorğusu
 * @param errorMessage - Xəta mesajı
 * @returns Sorğunun nəticəsi və ya null
 */
export const executeQuery = async <T>(
  queryPromise: any,
  errorMessage: string
): Promise<T | null> => {
  try {
    // Sorğunu icra et (await əlavə edirik)
    const { data, error } = await queryPromise;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
};

/**
 * İstifadəçinin roluna görə müəyyən entity-də icazəsi olub-olmadığını yoxlayır
 * @param userId - İstifadəçi ID-si
 * @param role - İstifadəçi rolu
 * @returns İcazənin olub-olmadığı
 */
export const checkUserPermissionByRole = async (
  userId: string,
  role: string
): Promise<boolean> => {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('İstifadəçi rolu yoxlanarkən xəta:', error);
    return false;
  }
  
  return data?.role === role;
};

/**
 * İcazə yoxlama funksiyası
 */
export const checkPermission = async (
  userId: string, 
  role: string | undefined, 
  userRegionId: string | undefined, 
  entityId: string, 
  level: PermissionLevel = 'read'
): Promise<boolean> => {
  // Burada icazə məntiqini implemente et
  if (!userId) return false;

  // Sadə icazə yoxlaması 
  // SuperAdmin hər şeyə icazəlidir
  if (role === 'superadmin') return true;
  
  // RegionAdmin öz regionuna aid resurslara icazəlidir
  if (role === 'regionadmin' && userRegionId === entityId) return true;
  
  // Digər istifadəçilər üçün icazə sorğusu
  const { data, error } = await supabase
    .from('user_roles')
    .select('role, region_id, sector_id, school_id')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('İcazə yoxlanarkən xəta:', error);
    return false;
  }
  
  if (!data) return false;
  
  // Oxuma icazəsi üçün daha genişdir
  if (level === 'read') {
    return true; // Hər kəs oxuya bilər, daha spesifik məntiq əlavə edilə bilər
  }
  
  return false; // Yazma icazəsi daha məhduddur
};
