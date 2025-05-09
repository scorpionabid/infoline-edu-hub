
import { supabase } from '@/integrations/supabase/client';
import { PermissionLevel, PermissionResult } from './permissionTypes';

// Check if user has permission to access a region
export const checkRegionPermission = async (
  userId: string,
  regionId: string,
  level: PermissionLevel = 'read'
): Promise<PermissionResult> => {
  try {
    const { data, error } = await supabase.rpc('has_region_access', {
      p_user_id: userId,
      p_region_id: regionId,
      p_level: level
    });
    
    if (error) throw error;
    
    return {
      granted: Boolean(data),
      message: data ? 'Access granted' : 'Access denied'
    };
  } catch (error: any) {
    console.error('Error checking region permission:', error);
    return {
      granted: false,
      message: error.message || 'Error checking permission',
      code: 'ERROR'
    };
  }
};

// Check if user has permission to access a sector
export const checkSectorPermission = async (
  userId: string,
  sectorId: string,
  level: PermissionLevel = 'read'
): Promise<PermissionResult> => {
  try {
    const { data, error } = await supabase.rpc('has_sector_access', {
      p_user_id: userId,
      p_sector_id: sectorId,
      p_level: level
    });
    
    if (error) throw error;
    
    return {
      granted: Boolean(data),
      message: data ? 'Access granted' : 'Access denied'
    };
  } catch (error: any) {
    console.error('Error checking sector permission:', error);
    return {
      granted: false,
      message: error.message || 'Error checking permission',
      code: 'ERROR'
    };
  }
};
