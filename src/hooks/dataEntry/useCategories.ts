
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { CategoryWithColumns, CategoryStatus, CategoryAssignment } from '@/types/category';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { Column } from '@/types/column';

export const useCategories = () => {
  const { hasRegionAccess, hasSectorAccess, hasRoleAtLeast } = usePermissions();
  const { user } = useAuthStore(); 

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      let query = supabase.from('categories').select(`
        *,
        columns (*)
      `);

      // Apply role-based filters
      if (hasRoleAtLeast('superadmin')) {
        // Super admin sees all categories
      } else if (hasRoleAtLeast('regionadmin')) {
        if (user?.region_id) {
          query = query.eq('region_id', user.region_id)
            .or(`region_id.is.null,assignment.eq.region`);
        }
      } else if (hasRoleAtLeast('sectoradmin')) {
        if (user?.sector_id) {
          query = query.eq('sector_id', user.sector_id)
            .or(`sector_id.is.null,assignment.eq.sector`);
        }
      } else {
        // School admin or regular user
        query = query.eq('assignment', 'school');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to ensure type safety
      return data.map(category => {
        const columns = category.columns as Column[];
        
        return {
          ...category,
          status: category.status as CategoryStatus,
          assignment: (category.assignment || null) as CategoryAssignment,
          columns,
          columnCount: columns.length,
        };
      });
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useCategories;
