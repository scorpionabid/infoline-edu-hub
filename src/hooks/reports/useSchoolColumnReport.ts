import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Tip təyinləri - real layihədə bunlar ayrı tiplər faylında olmalıdır
export interface SchoolColumnData {
  id: string;
  schoolId: string;
  schoolName: string;
  columnId: string;
  columnName: string;
  value: string;
  category?: string;
  status?: string;
}

export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  includeHeaders?: boolean;
  fileName?: string;
  selectedColumnsOnly?: boolean;
  selectedSchoolsOnly?: boolean;
}

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

  const exportReport = useCallback(async (options: ExportOptions) => {
    setExportLoading(true);
    try {
      // Burada API sorğusu olacaq
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
      toast.success('Hesabat uğurla ixrac edildi');
    } catch (err: any) {
      toast.error('Hesabat ixrac edilərkən xəta baş verdi');
      console.error('Export error:', err);
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
    exportLoading,
    loadData,
    toggleSchoolSelection,
    toggleColumnSelection,
    exportReport
  };
};

export default useSchoolColumnReport;
