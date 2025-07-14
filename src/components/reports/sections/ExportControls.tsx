import React from 'react';
import { ExportButtons } from '@/components/ui/export-buttons';

interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

interface SchoolColumnData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  columns: {
    [columnId: string]: {
      value: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }
  };
}

interface ExportControlsProps {
  selectedColumnIds: string[];
  columns: Column[];
  schoolColumnData: SchoolColumnData[];
  isLoading: boolean;
  schoolsCount: number;
  selectedColumnsCount: number;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  selectedColumnIds,
  columns,
  schoolColumnData,
  isLoading,
  schoolsCount,
  selectedColumnsCount
}) => {
  const handleExport = async (format: string) => {
    if (selectedColumnIds.length === 0) {
      alert('Ən azı bir sütun seçin');
      return;
    }
    
    const selectedColumnsData = columns.filter(col => selectedColumnIds.includes(col.id));
    const exportData = schoolColumnData.map(schoolData => {
      const row: any = {
        'Məktəb': schoolData.school_name,
        'Region': schoolData.region_name,
        'Sektor': schoolData.sector_name
      };
      
      selectedColumnsData.forEach(col => {
        const columnData = schoolData.columns[col.id];
        row[col.name] = columnData?.value || 'Daxil edilməyib';
        row[`${col.name} - Status`] = columnData?.status || 'pending';
      });
      
      return row;
    });
    
    console.log(`Exporting ${exportData.length} rows as ${format}`, exportData);
    
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
  };

  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        {schoolsCount} məktəb taplandı, {selectedColumnsCount} sütun seçilib
        {schoolColumnData.length > 0 && ` | ${schoolColumnData.length} məktəb cədvəldə`}
      </div>
      <ExportButtons 
        onExportExcel={() => handleExport('excel')}
        onExportPDF={() => handleExport('pdf')}
        onExportCSV={() => handleExport('csv')}
        isLoading={isLoading}
        disabled={selectedColumnIds.length === 0}
      />
    </div>
  );
};

export default ExportControls;