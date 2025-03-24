
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { exportSchoolsToExcel } from '@/utils/excelUtils';
import { useRegions } from '../useRegions';
import { useSectors } from '../useSectors';

export const useImportExport = (onComplete: () => void) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useLanguage();
  const { regions } = useRegions();
  const { sectors } = useSectors();

  // Map üçün region və sektorları hazırlayırıq
  const regionNames = regions.reduce((acc, region) => ({
    ...acc,
    [region.id]: region.name
  }), {} as {[key: string]: string});

  const sectorNames = sectors.reduce((acc, sector) => ({
    ...acc,
    [sector.id]: sector.name
  }), {} as {[key: string]: string});

  const handleExportToExcel = useCallback(async (schools: School[]) => {
    setIsExporting(true);
    try {
      exportSchoolsToExcel(schools, regionNames, sectorNames);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('exportFailed'), {
        description: t('exportFailedDescription')
      });
    } finally {
      setIsExporting(false);
    }
  }, [regionNames, sectorNames, t]);

  const handleImportSchools = useCallback(async (schools: Partial<School>[]) => {
    setIsImporting(true);
    try {
      // Əgər schools boş və ya undefined isə, erkən çıxırıq
      if (!schools || schools.length === 0) {
        toast.error(t('noDataToImport'));
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Hər bir məktəbi əlavə edirik
      for (const school of schools) {
        try {
          // Zəruri sahələrin olduğunu yoxlayırıq
          if (!school.name) {
            errorCount++;
            continue;
          }

          const { error } = await supabase
            .from('schools')
            .insert([school]);

          if (error) {
            console.error('Error inserting school:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('School import error:', err);
          errorCount++;
        }
      }

      // Nəticəni bildiririk
      if (successCount > 0) {
        toast.success(
          t('importCompleted'), 
          { description: `${successCount} ${t('schoolsImportedSuccessfully')}` }
        );
        onComplete(); // Məlumatları yeniləmək üçün callback-i çağırırıq
      }

      if (errorCount > 0) {
        toast.error(
          `${errorCount} ${t('schoolsFailedToImport')}`,
          { description: t('checkDataAndTryAgain') }
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(t('importFailed'), {
        description: t('importFailedDescription')
      });
    } finally {
      setIsImporting(false);
    }
  }, [t, onComplete]);

  return {
    isImportDialogOpen,
    isExporting,
    isImporting,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  };
};
