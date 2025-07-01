
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UseSectorsQueryResult {
  sectors: any[];
  loading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSectorsQuery = (): UseSectorsQueryResult => {
  const {
    data: sectors = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      // Sektorları əldə et
      const { data: sectors, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Sektor adminlərini əldə et
      let sectorAdmins: any = {};
      if (sectors) {
        const { data: adminData } = await supabase
          .from('user_roles')
          .select(`
            sector_id,
            profiles:user_id(
              id,
              full_name,
              email
            )
          `)
          .eq('role', 'sectoradmin');
        
        if (adminData) {
          sectorAdmins = adminData.reduce((acc: any, item: any) => {
            if (item.sector_id && item.profiles) {
              acc[item.sector_id] = item.profiles;
            }
            return acc;
          }, {});
        }
      }
      
      // Admin məlumatları ilə birləşdir
      const enhancedSectors = (sectors || []).map(sector => ({
        ...sector,
        admin_name: sectorAdmins[sector.id]?.full_name || '',
        admin_email: sectorAdmins[sector.id]?.email || ''
      }));
      
      return enhancedSectors;
    }
  });

  return {
    sectors,
    loading: isLoading,
    isLoading,
    isError,
    error: error?.message || null,
    refetch
  };
};

export default useSectorsQuery;
