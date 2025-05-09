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

// Function to check if a user can manage a specific region
export const canManageRegion = async (regionId: string): Promise<boolean> => {
  try {
    // Get the current user's role and region_id from auth context
    const user = useAuthStore.getState().user;
    const userRole = useAuthStore.getState().user?.role;
    
    if (!user || !userRole) return false;
    
    // Superadmins can manage all regions
    if (userRole === 'superadmin') return true;
    
    // Regionadmins can only manage their assigned region
    if (userRole === 'regionadmin') {
      const { data, error } = await supabase.rpc('check_region_access', {
        region_id_param: regionId
      });
      
      if (error) {
        console.error('Error checking region access:', error);
        return false;
      }
      
      return !!data;
    }
    
    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Function to check if a user can manage a specific sector
export const canManageSector = async (sectorId: string): Promise<boolean> => {
  try {
    // Get the current user's role and region_id from auth context
    const user = useAuthStore.getState().user;
    const userRole = useAuthStore.getState().user?.role;
    
    if (!user || !userRole) return false;
    
    // Superadmins can manage all sectors
    if (userRole === 'superadmin') return true;
    
    // Regionadmins can manage sectors in their region
    if (userRole === 'regionadmin') {
      const { data, error } = await supabase.rpc('check_sector_access', {
        sector_id_param: sectorId
      });
      
      if (error) {
        console.error('Error checking sector access:', error);
        return false;
      }
      
      return !!data;
    }
    
    // Sectoradmins can only manage their assigned sector
    if (userRole === 'sectoradmin') {
      return user.sector_id === sectorId;
    }
    
    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};
