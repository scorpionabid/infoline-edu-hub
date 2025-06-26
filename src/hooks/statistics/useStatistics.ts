
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, selectUser, selectUserRole } from '@/hooks/auth/useAuthStore';
import { statisticsService, StatisticsFilters } from '@/services/statisticsService';

export const useStatistics = (filters?: StatisticsFilters) => {
  const user = useAuthStore(selectUser);
  const userRole = useAuthStore(selectUserRole);

  const getEntityId = () => {
    if (!user || !userRole) return undefined;
    
    switch (userRole) {
      case 'regionadmin': {
        return user.region_id;
      case 'sectoradmin': {
        return user.sector_id;
      case 'schooladmin': {
        return user.school_id;
      default:
        return undefined;
    }
  };

  return useQuery({
    queryKey: ['statistics', userRole, getEntityId(), filters],
    queryFn: async () => {
      if (!userRole) {
        throw new Error('İstifadəçi rolu təyin edilməyib');
      }
      
      return await statisticsService.getStatistics(
        userRole as any,
        getEntityId(),
        // filters
      );
    },
    enabled: !!userRole && ['superadmin', 'regionadmin', 'sectoradmin'].includes(userRole),
    staleTime: 5 * 60 * 1000, // 5 dəqiqə
    refetchInterval: 10 * 60 * 1000, // 10 dəqiqədə bir yenilə
  });
};
