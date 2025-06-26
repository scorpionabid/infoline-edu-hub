
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useSmartTranslation } from '@/hooks/translation/useSmartTranslation';
import * as XLSX from 'xlsx';

interface StatisticsExportProps {
  data: any;
  filters: any;
  onExport?: (format: 'excel' | 'csv' | 'pdf') => void;
}

export const StatisticsExport: React.FC<StatisticsExportProps> = ({
  data,
  filters,
  // onExport
}) => {
  const { tSafe } = useSmartTranslation();

  const exportToExcel = () => {
    try {
      const exportData = [
        ['Statistika Hesabatı'],
        [''],
        ['Ümumi Statistika'],
        ['Məktəblər sayı', data?.totalSchools?.toString() || '0'],
        ['İstifadəçilər sayı', data?.totalUsers?.toString() || '0'],
        ['Tamamlanma dərəcəsi', `${data?.completionRate || 0}%`],
        [''],
        ['Export Tarixi', new Date().toLocaleDateString('az-AZ')]
      ];

      if (data?.regionStats) {
        exportData.push([''], ['Region Statistikası']);
        data.regionStats.forEach((region: any) => {
          exportData.push([
            region.name,
            region.schoolCount?.toString() || '0',
            `${region.completionRate || 0}%`
          ]);
        });
      }

      const ws = XLSX.utils.aoa_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Statistika');
      
      XLSX.writeFile(wb, `statistika_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      onExport?.('excel');
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = [
        'Göstərici,Dəyər',
        `Məktəblər sayı,${data?.totalSchools || 0}`,
        `İstifadəçilər sayı,${data?.totalUsers || 0}`,
        `Tamamlanma dərəcəsi,${data?.completionRate || 0}%`
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `statistika_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onExport?.('csv');
    } catch (error) {
      console.error('CSV export error:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        // Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        // CSV
      </Button>
    </div>
  );
};

export default StatisticsExport;
