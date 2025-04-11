
import { School } from '@/types/supabase';
import { convertSupabaseToSchool } from '@/data/schoolsData';
import { useImportExport } from './useImportExport';

/**
 * Məktəb məlumatlarını Excel formatında ixrac etmək üçün adapter hook
 * @param schools İxrac ediləcək məktəblər siyahısı
 */
export const useExportAdapter = (schools: School[]) => {
  const { handleExportToExcel } = useImportExport(() => {});

  /**
   * Excel ixrac prosesini başladan funksiya
   */
  const handleExportClick = () => {
    // Tip uyğunluğu üçün SupabaseSchool -> School konvertasiyası
    const schoolsForExport = schools.map(school => {
      return convertSupabaseToSchool(school);
    });
    handleExportToExcel(schoolsForExport);
  };

  return { handleExportClick };
};
