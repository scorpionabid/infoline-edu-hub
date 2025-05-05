import { useState, useEffect, useCallback } from 'react';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { toast } from 'sonner';

// Mock data - real API üçün dəyişdiriləcək
const fetchSchoolColumnData = async (): Promise<SchoolColumnData[]> => {
  // Burada API sorğusu olacaq
  return Promise.resolve([]);
};

export const useSchoolColumnReport = () => {
  const [data, setData] = useState<SchoolColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSchoolColumnData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
      toast.error('Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSchoolSelection = useCallback((schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  }, []);

  const toggleColumnSelection = useCallback((columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  }, []);

  const exportToExcel = useCallback(async (options: ExportOptions = {}): Promise<boolean> => {
    setExportLoading(true);
    try {
      // Burada export məntiqi olacaq
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulated
      toast.success('Məlumatlar uğurla ixrac edildi');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'İxrac zamanı xəta baş verdi');
      return false;
    } finally {
      setExportLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    selectedSchools,
    selectedColumns,
    toggleSchoolSelection,
    toggleColumnSelection,
    exportToExcel,
    exportLoading,
    refresh: loadData
  };
};

export default useSchoolColumnReport;
