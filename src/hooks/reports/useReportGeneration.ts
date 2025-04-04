import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { useAuth } from '@/context/AuthContext';

interface ReportFilter {
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  columns?: string[];
  groupBy?: string;
  orderBy?: string;
  limit?: number;
}

interface ReportData {
  id: string;
  name: string;
  description?: string;
  type: string;
  filters: ReportFilter;
  createdAt: string;
  createdBy: string;
}

export const useReportGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { t } = useLanguage();
  const { user } = useAuth();

  // Hesabat yaratmaq
  const createReport = useCallback(async (reportInfo: Omit<ReportData, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!user) {
      toast.error(t('userNotAuthenticated'));
      return null;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('data_entries')
        .insert({
          name: reportInfo.name,
          description: reportInfo.description,
          type: reportInfo.type,
          filters: reportInfo.filters,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(t('reportSaved'));
      return data;
    } catch (error: any) {
      console.error('Hesabat yaradarkən xəta:', error);
      toast.error(t('errorSavingReport'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  // Hesabatı silmək
  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success(t('reportDeleted'));
      return true;
    } catch (error: any) {
      console.error('Hesabatı silməkdə xəta:', error);
      toast.error(t('errorDeletingReport'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Hesabat generasiyası
  const generateReport = useCallback(async (filters: ReportFilter) => {
    try {
      setLoading(true);
      
      let query = supabase.rpc('generate_report', {
        p_region_id: filters.regionId || null,
        p_sector_id: filters.sectorId || null,
        p_school_id: filters.schoolId || null,
        p_category_id: filters.categoryId || null,
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null,
        p_columns: filters.columns || null,
        p_group_by: filters.groupBy || null,
        p_order_by: filters.orderBy || null,
        p_limit: filters.limit || 100
      });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setReportData(data || []);
      
      // Chart data hazırla
      if (data && data.length > 0) {
        const chartData = prepareChartData(data, filters.groupBy || 'school_name');
        setChartData(chartData);
      }
      
      toast.success(t('reportGenerated'));
      return data;
    } catch (error: any) {
      console.error('Hesabat yaradılırkən xəta:', error);
      toast.error(t('errorGeneratingReport'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  // Cədvəl məlumatlarını çarta uyğun formatda hazırlamaq
  const prepareChartData = (data: any[], groupBy: string) => {
    if (!data || data.length === 0) return [];
    
    // Əgər data içərisində completion_rate sahəsi varsa, onu istifadə edirik
    if (data[0].hasOwnProperty('completion_rate')) {
      return data.map(item => ({
        name: item[groupBy] || 'Unknown',
        value: item.completion_rate
      }));
    }
    
    // Əgər xüsusi bir məlumat sahəsi yoxdursa, default olaraq count istifadə edirik
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const key = item[groupBy] || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Hesabatı Excel formatında ixrac etmək
  const exportReportToExcel = useCallback((fileName: string = 'report') => {
    if (!reportData || reportData.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }
    
    try {
      exportToExcel(reportData, fileName);
      toast.success(t('exportSuccess'));
    } catch (error) {
      console.error('Excel ixrac zamanı xəta:', error);
      toast.error(t('errorExportingToExcel'));
    }
  }, [reportData, t]);

  return {
    loading,
    reportData,
    chartData,
    createReport,
    deleteReport,
    generateReport,
    exportReportToExcel
  };
};
