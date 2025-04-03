
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DataEntry } from '@/types/dataEntry';

export const exportToExcel = (data: any[], fileName: string = 'data-export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob and save
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// DataEntries üçün xüsusi export funksiyası
export const exportDataToExcel = (entries: DataEntry[]) => {
  // Verilənləri Excel üçün uyğun formatda hazırlayaq
  const formattedData = entries.map(entry => ({
    Category: entry.category_id, // Burada kateqoriya adını almaq üçün əlavə məntiqdən istifadə edə bilərsiniz
    Column: entry.column_id, // Sütun adı ilə dəyişdirilə bilər
    School: entry.school_id, // Məktəb adı ilə dəyişdirilə bilər
    Value: entry.value || '',
    Status: entry.status || 'pending',
    CreatedAt: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '',
    UpdatedAt: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : '',
  }));
  
  exportToExcel(formattedData, 'data-entries');
};
