
import { useState, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { ExcelService } from '@/services/excelService';
import { ExportOptions } from '@/types/excel';

interface UseExcelExportOptions {
  category: CategoryWithColumns;
  schoolId: string;
  onExportComplete?: (success: boolean) => void;
}

export const useExcelExport = ({
  category,
  schoolId,
  onExportComplete
}: UseExcelExportOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State management
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportInfo, setLastExportInfo] = useState<{
    fileName: string;
    timestamp: string;
    rowCount: number;
  } | null>(null);
  
  /**
   * Export data to Excel
   */
  const exportData = useCallback(async (options?: ExportOptions) => {
    if (!category?.id) {
      toast({
        title: t('error'),
        description: t('categoryNotAvailable'),
        variant: 'destructive'
      });
      return;
    }
    
    if (!schoolId) {
      toast({
        title: t('error'),
        description: t('schoolNotAvailable'),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsExporting(true);
      
      await ExcelService.downloadExport(
        schoolId,
        category.id,
        category.name,
        {
          format: 'xlsx',
          includeMetadata: true,
          includeHeaders: true,
          ...options
        }
      );
      
      // Update last export info
      const exportInfo = {
        fileName: `${category.name}_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        timestamp: new Date().toISOString(),
        rowCount: 0 // This would be updated with actual row count from service
      };
      
      setLastExportInfo(exportInfo);
      
      toast({
        title: t('success'),
        description: t('dataExportedSuccessfully'),
      });
      
      onExportComplete?.(true);
      
    } catch (error: any) {
      console.error('Export failed:', error);
      
      toast({
        title: t('error'),
        description: error.message || t('errorExportingData'),
        variant: 'destructive'
      });
      
      onExportComplete?.(false);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [category, schoolId, onExportComplete, t, toast]);
  
  /**
   * Export filtered data
   */
  const exportFilteredData = useCallback(async (
    filters: {
      status?: string[];
      dateRange?: { start: string; end: string };
      columns?: string[];
    },
    options?: ExportOptions
  ) => {
    await exportData({
      filterByStatus: filters.status,
      dateRange: filters.dateRange,
      customColumns: filters.columns,
      ...options
    });
  }, [exportData]);
  
  /**
   * Export as CSV
   */
  const exportAsCSV = useCallback(async (options?: ExportOptions) => {
    await exportData({
      format: 'csv',
      includeMetadata: false,
      ...options
    });
  }, [exportData]);
  
  return {
    // State
    isExporting,
    lastExportInfo,
    
    // Actions
    exportData,
    exportFilteredData,
    exportAsCSV,
    
    // Computed
    canExport: !isExporting && category && schoolId
  };
};
