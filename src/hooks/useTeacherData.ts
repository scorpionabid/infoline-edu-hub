
import { useCachedQuery } from '@/hooks/useCachedQuery';
import { fetchCached } from '@/api/cachedApi';

/**
 * Müəllim məlumatlarını keşləyərək əldə etmək üçün hook
 */
export function useTeacherData(schoolId?: string) {
  return useCachedQuery(
    ['teachers', schoolId], 
    async () => {
      // Edge Function əsaslı keşləmə
      if (schoolId) {
        const response = await fetchCached({
          table: 'teachers',
          filters: [
            { column: 'school_id', operator: 'eq', value: schoolId }
          ],
          orderBy: { column: 'full_name', ascending: true }
        }, {
          cacheKey: `school_teachers_${schoolId}`,
          expirySeconds: 1800 // 30 dəqiqə
        });
        
        return response.data;
      }
      
      const response = await fetchCached({
        table: 'teachers',
        orderBy: { column: 'full_name', ascending: true },
        limit: 100
      }, {
        cacheKey: 'all_teachers',
        expirySeconds: 3600 // 1 saat
      });
      
      return response.data;
    },
    {
      enabled: true,
      staleTime: 1000 * 60 * 5, // 5 dəqiqə ərzində məlumatın "təzə" sayılması
      cacheTime: 1000 * 60 * 60, // 1 saat ərzində keşdə saxlanılması
    },
    {
      expiryInMinutes: 60 // localStorage-da da 1 saat saxla
    }
  );
}
