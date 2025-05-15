
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';

interface UsePermissionsResult {
  hasRegionAccess?: boolean;
  hasSectorAccess?: boolean;
  hasRoleAtLeast?: (role: string) => boolean;
}

// Mock permissions hook - replace with your actual permissions hook
const usePermissions = (): UsePermissionsResult => {
  return {
    hasRegionAccess: true,
    hasSectorAccess: true,
    hasRoleAtLeast: (role: string) => true,
  };
};

// Mock auth store - replace with your actual auth store
const useAuthStore = () => {
  return {
    user: { id: '1', region_id: '1', sector_id: '1', role: 'admin' }
  };
};

export const useCategories = () => {
  const permissions = usePermissions();
  const authStore = useAuthStore();
  const { user } = authStore;

  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async (): Promise<CategoryWithColumns[]> => {
      let query = supabase.from('categories').select(`
        *,
        columns (*)
      `);

      // Apply role-based filters based on the user's role
      if (user?.role === 'superadmin') {
        // Super admin sees all categories
      } else if (user?.role === 'regionadmin') {
        if (user?.region_id) {
          query = query.eq('region_id', user.region_id)
            .or(`region_id.is.null,assignment.eq.region`);
        }
      } else if (user?.role === 'sectoradmin') {
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
        const typedColumns = (category.columns || []).map((col: any) => {
          // Parse JSON fields if they're stored as strings
          const options = col.options 
            ? (typeof col.options === 'string' ? JSON.parse(col.options) : col.options)
            : [];
            
          const validation = col.validation
            ? (typeof col.validation === 'string' ? JSON.parse(col.validation) : col.validation)
            : {};

          return {
            ...col,
            options,
            validation
          } as Column;
        });
        
        return {
          ...category,
          columns: typedColumns,
          columnCount: typedColumns.length,
        } as CategoryWithColumns;
      });
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useCategories;
