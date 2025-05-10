
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the user has access to a specific region
 */
export const checkRegionAccess = async (regionId: string) => {
  try {
    const { data, error } = await supabase.rpc('has_region_access', { 
      region_id_param: regionId 
    });
    
    if (error) {
      console.error('Error checking region access:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkRegionAccess:', error);
    return false;
  }
};

/**
 * Check if the user has access to a specific sector
 */
export const checkSectorAccess = async (sectorId: string) => {
  try {
    const { data, error } = await supabase.rpc('has_sector_access', { 
      sector_id_param: sectorId 
    });
    
    if (error) {
      console.error('Error checking sector access:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkSectorAccess:', error);
    return false;
  }
};

/**
 * Check if the user has access to a specific school
 */
export const checkSchoolAccess = async (schoolId: string) => {
  try {
    const { data, error } = await supabase.rpc('has_school_access', { 
      school_id_param: schoolId 
    });
    
    if (error) {
      console.error('Error checking school access:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkSchoolAccess:', error);
    return false;
  }
};

/**
 * Check if the user is a superadmin
 */
export const checkIsSuperAdmin = async () => {
  try {
    const { data, error } = await supabase.rpc('is_superadmin');
    
    if (error) {
      console.error('Error checking superadmin status:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkIsSuperAdmin:', error);
    return false;
  }
};

/**
 * Check if the user is a region admin
 */
export const checkIsRegionAdmin = async () => {
  try {
    const { data, error } = await supabase.rpc('is_regionadmin');
    
    if (error) {
      console.error('Error checking region admin status:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkIsRegionAdmin:', error);
    return false;
  }
};

/**
 * Check if the user is a sector admin
 */
export const checkIsSectorAdmin = async () => {
  try {
    const { data, error } = await supabase.rpc('is_sectoradmin');
    
    if (error) {
      console.error('Error checking sector admin status:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error in checkIsSectorAdmin:', error);
    return false;
  }
};
