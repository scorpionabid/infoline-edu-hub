import { useState, useEffect, useCallback } from 'react';
import { SchoolColumnData, ExportOptions, StatusFilterOptions } from '@/types/report';
import { fetchSchoolColumnData, exportDataToExcel, updateDataStatus } from '@/services/reportService';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useSchoolColumnReport = (initialCategoryId?: string) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSectorAdmin } = usePermissions();
  
  const [data, setData] = useState<SchoolColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [regionId, setRegionId] = useState<string | undefined>(undefined);
  const [sectorId, setSectorId] = useState<string | undefined>(undefined);
  
  // Sektoradmin üçün avtomatik olaraq sektorId-ni təyin edirik
  useEffect(() => {
    if (isSectorAdmin && currentUser?.sectorId) {
      setSectorId(currentUser.sectorId);
    }
  }, [isSectorAdmin, currentUser]);
  
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
  
  // Məlumatları təsdiq etmək üçün funksiya
  const approveData = useCallback(async (schoolId: string, feedback?: string) => {
    setLoading(true);
    try {
      await updateDataStatus(schoolId, categoryId!, 'approved', feedback);
      toast.success(t('dataApproved'));
      
      // Məlumatları yeniləyirik
      setData(prevData => 
        prevData.map(item => 
          item.schoolId === schoolId 
            ? { ...item, status: 'approved', feedback: feedback || item.feedback }
            : item
        )
      );
    } catch (err: any) {
      toast.error(t('errorApprovingData'));
      console.error('Error approving data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);
  
  // Məlumatları rədd etmək üçün funksiya
  const rejectData = useCallback(async (schoolId: string, feedback: string) => {
    if (!feedback) {
      toast.error(t('feedbackRequired'));
      return;
    }
    
    setLoading(true);
    try {
      await updateDataStatus(schoolId, categoryId!, 'rejected', feedback);
      toast.success(t('dataRejected'));
      
      // Məlumatları yeniləyirik
      setData(prevData => 
        prevData.map(item => 
          item.schoolId === schoolId 
            ? { ...item, status: 'rejected', feedback }
            : item
        )
      );
    } catch (err: any) {
      toast.error(t('errorRejectingData'));
      console.error('Error rejecting data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);
  
  // Seçilmiş məktəbləri toplu şəkildə təsdiq etmək
  const approveBulk = useCallback(async (schoolIds: string[], feedback?: string) => {
    setLoading(true);
    try {
      const promises = schoolIds.map(id => updateDataStatus(id, categoryId!, 'approved', feedback));
      await Promise.all(promises);
      toast.success(t('bulkDataApproved'));
      
      // Məlumatları yeniləyirik
      setData(prevData => 
        prevData.map(item => 
          schoolIds.includes(item.schoolId) 
            ? { ...item, status: 'approved', feedback: feedback || item.feedback }
            : item
        )
      );
    } catch (err: any) {
      toast.error(t('errorBulkApproving'));
      console.error('Error bulk approving data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);
  
  // Seçilmiş məktəbləri toplu şəkildə rədd etmək
  const rejectBulk = useCallback(async (schoolIds: string[], feedback: string) => {
    if (!feedback) {
      toast.error(t('feedbackRequired'));
      return;
    }
    
    setLoading(true);
    try {
      const promises = schoolIds.map(id => updateDataStatus(id, categoryId!, 'rejected', feedback));
      await Promise.all(promises);
      toast.success(t('bulkDataRejected'));
      
      // Məlumatları yeniləyirik
      setData(prevData => 
        prevData.map(item => 
          schoolIds.includes(item.schoolId) 
            ? { ...item, status: 'rejected', feedback }
            : item
        )
      );
    } catch (err: any) {
      toast.error(t('errorBulkRejecting'));
      console.error('Error bulk rejecting data:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, t]);
  
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
    exportToExcel,
    approveData,
    rejectData,
    approveBulk,
    rejectBulk
  };
};
