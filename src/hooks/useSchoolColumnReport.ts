
import { useState, useEffect, useCallback } from 'react';
import { SchoolColumnData, ExportOptions, StatusFilterOptions } from '@/types/report';
import { fetchSchoolColumnData, exportDataToExcel } from '@/services/reportService';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useSchoolColumnReport = (initialCategoryId?: string) => {
  const { t } = useLanguage();
  const [data, setData] = useState<SchoolColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [regionId, setRegionId] = useState<string | undefined>(undefined);
  const [sectorId, setSectorId] = useState<string | undefined>(undefined);
  
  const loadData = useCallback(async () => {
    if (!categoryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const reportData = await fetchSchoolColumnData(categoryId, regionId, sectorId);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || t('errorLoadingData'));
      toast.error(t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  }, [categoryId, regionId, sectorId, t]);
  
  const exportData = useCallback(async (options?: ExportOptions) => {
    if (!categoryId || data.length === 0) {
      toast.error(t('noDataToExport'));
      return null;
    }
    
    try {
      const url = await exportDataToExcel(data, options);
      toast.success(t('exportSuccess'));
      return url;
    } catch (err) {
      toast.error(t('exportError'));
      return null;
    }
  }, [categoryId, data, t]);
  
  const exportToExcel = useCallback(() => {
    exportData({
      fileName: `school-data-${categoryId}`,
      includeStatus: true
    });
  }, [exportData, categoryId]);
  
  useEffect(() => {
    if (categoryId) {
      loadData();
    }
  }, [categoryId, regionId, sectorId, loadData]);
  
  const filteredData = useCallback(() => {
    if (statusFilter === 'all') return data;
    
    return data.filter(item => item.status.toLowerCase() === statusFilter);
  }, [data, statusFilter]);
  
  return {
    data: filteredData(),
    loading,
    error,
    categoryId,
    setCategoryId,
    statusFilter,
    setStatusFilter,
    regionId,
    setRegionId,
    sectorId,
    setSectorId,
    loadData,
    exportData,
    exportToExcel
  };
};
