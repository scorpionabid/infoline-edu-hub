import { useCallback } from 'react';
import { Column, SchoolColumnData, formatDataForExport } from '@/utils/reports/schoolColumnDataUtils';

export const useSchoolColumnExport = () => {
  const handleExport = useCallback(async (
    format: 'excel' | 'csv' | 'pdf',
    schoolColumnData: SchoolColumnData[],
    selectedColumns: Column[]
  ) => {
    if (selectedColumns.length === 0) {
      alert('Ən azı bir sütun seçin');
      return;
    }

    const exportData = formatDataForExport(schoolColumnData, selectedColumns);
    
    if (format === 'excel') {
      try {
        // Import XLSX dynamically
        // @ts-ignore
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, "Məktəb Məlumatları");
        XLSX.writeFile(wb, `məktəb-sütun-məlumatları-${new Date().toISOString().split('T')[0]}.xlsx`);
      } catch (error) {
        console.error('Excel export error:', error);
        alert('Excel ixracında xəta baş verdi');
      }
    } else if (format === 'csv') {
      // Simple CSV export
      const csvContent = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `məktəb-sütun-məlumatları-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }, []);

  return { handleExport };
};
