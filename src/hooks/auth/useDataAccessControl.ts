
import { useCallback } from 'react';
import { usePermissions } from './usePermissions';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

export const useDataAccessControl = () => {
  const { user } = useAuth();
  const { 
    isSuperAdmin, 
    isRegionAdmin, 
    isSectorAdmin, 
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  } = usePermissions();

  const checkDataAccess = useCallback(async (schoolId: string, categoryId: string) => {
    if (!user) return false;

    try {
      const { data: hasAccess } = await supabase.rpc('can_access_data_entry', {
        user_id_param: user.id,
        entry_id_param: categoryId
      });

      return hasAccess;
    } catch (error) {
      console.error('Error checking data access:', error);
      return false;
    }
  }, [user]);

  const getAccessibleSchools = useCallback(async () => {
    if (!user) return [];

    try {
      const { data: schoolIds } = await supabase.rpc('get_accessible_schools', {
        user_id_param: user.id
      });

      if (schoolIds && schoolIds.length > 0) {
        const { data: schools } = await supabase
          .from('schools')
          .select('id, name, region_id, sector_id')
          .in('id', schoolIds);

        return schools || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching accessible schools:', error);
      return [];
    }
  }, [user]);

  const getAccessibleCategories = useCallback(async () => {
    if (!user) return [];

    const query = supabase.from('categories').select('*').eq('archived', false);

    if (isSchoolAdmin) {
      query.eq('assignment', 'all');
    } else if (isSectorAdmin) {
      query.in('assignment', ['all', 'sectors']);
    }

    try {
      const { data: categories } = await query;
      return categories || [];
    } catch (error) {
      console.error('Error fetching accessible categories:', error);
      return [];
    }
  }, [user, isSchoolAdmin, isSectorAdmin]);

  return {
    checkDataAccess,
    getAccessibleSchools,
    getAccessibleCategories,
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    regionId,
    sectorId,
    schoolId
  };
};
