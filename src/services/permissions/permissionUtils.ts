
import { supabase } from '@/integrations/supabase/client';
import { UserRoleData } from './permissionTypes';

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
