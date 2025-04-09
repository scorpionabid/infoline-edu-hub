
import { useState, useCallback, useEffect } from 'react';
import { SchoolColumnData, StatusFilterOptions } from '@/types/report';
import { fetchSchoolColumnData } from '@/services/reportService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useSchoolColumnReport = () => {
  const [data, setData] = useState<SchoolColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [regionId, setRegionId] = useState<string | undefined>(undefined);
  const [sectorId, setSectorId] = useState<string | undefined>(undefined);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterOptions>({
    pending: true,
    approved: true,
    rejected: false
  });
  const { t } = useLanguage();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reportData = await fetchSchoolColumnData(categoryId, statusFilter, regionId, sectorId);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || 'Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [categoryId, statusFilter, regionId, sectorId]);

  const exportToExcel = useCallback(() => {
    try {
      if (data.length === 0) {
        toast.warning(t('noDataToExport'));
        return;
      }

      // Məlumatları Excel formatına çevir
      const headers = [
        'Məktəb',
        'Region',
        'Sektor',
        'Status'
      ];

      // Sütun başlıqları
      if (data[0]?.columnData?.length > 0) {
        // Məlumatların ilk elementindəki sütunları istifadə et
        // Bu nümunədə sütun adlarını əlavə etmək üçün əlavə API çağırışı lazım ola bilər
        data[0].columnData.forEach((_, index) => {
          headers.push(`Sütun ${index + 1}`);
        });
      }

      const rows = data.map(school => {
        const row: any[] = [
          school.schoolName,
          school.region || '',
          school.sector || '',
          school.status
        ];

        // Sütun məlumatlarını əlavə et
        school.columnData.forEach(col => {
          row.push(col.value || '');
        });

        return row;
      });

      // Excel sənədini yarat
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəb Məlumatları');

      // Excel faylını yarat və yüklə
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Faylı yadda saxla
      saveAs(blob, `Məktəb_Məlumatları_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast.success(t('fileDownloaded'));
    } catch (err: any) {
      console.error('Excel ixracı zamanı xəta:', err);
      toast.error(t('exportError'));
    }
  }, [data, t]);

  const toggleSchoolSelection = useCallback((schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId) 
        : [...prev, schoolId]
    );
  }, []);

  const selectAllSchools = useCallback(() => {
    setSelectedSchools(data.map(school => school.schoolId));
  }, [data]);

  const deselectAllSchools = useCallback(() => {
    setSelectedSchools([]);
  }, []);

  const getSelectedSchoolsData = useCallback(() => {
    return data.filter(school => selectedSchools.includes(school.schoolId));
  }, [data, selectedSchools]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    categoryId,
    setCategoryId,
    regionId,
    setRegionId,
    sectorId,
    setSectorId,
    statusFilter,
    setStatusFilter,
    selectedSchools,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData,
    loadData,
    exportToExcel
  };
};
