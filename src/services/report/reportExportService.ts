
import { Report } from '@/types/report';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { handleReportError } from './reportBaseService';

export const exportReportToExcel = async (report: Report): Promise<void> => {
  try {
    // Hesabatdan məlumatları alırıq
    const reportData = report.content;
    
    // Excel üçün data array yaradırıq
    const worksheetData: any[] = [];
    
    // Əgər report content-də data array varsa, onu işlədirik
    if (reportData && reportData.data && Array.isArray(reportData.data)) {
      // Başlıqlar üçün ilk sətir
      if (reportData.columns && Array.isArray(reportData.columns)) {
        const headers = reportData.columns.map((col: any) => col.title || col.name);
        worksheetData.push(headers);
      }
      
      // Məlumat sətirləri
      reportData.data.forEach((row: any) => {
        const rowData = reportData.columns.map((col: any) => {
          const key = col.key || col.name;
          return row[key] || '';
        });
        worksheetData.push(rowData);
      });
    } else {
      // Əgər data formatı fərqlidirsə, sadəcə JSON-u flatlayırıq
      worksheetData.push(['Açar', 'Dəyər']);
      Object.entries(reportData || {}).forEach(([key, value]) => {
        worksheetData.push([key, JSON.stringify(value)]);
      });
    }
    
    // Worksheet yaradırıq
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Workbook yaradırıq və worksheet əlavə edirik
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Excel faylını yaradırıq
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Faylı yükləyirik
    saveAs(fileData, `${report.title || 'Report'}-${new Date().toISOString()}.xlsx`);
  } catch (error) {
    throw handleReportError(error);
  }
};

export const exportReportToPDF = async (report: Report): Promise<void> => {
  // PDF ixracı üçün funksionallıq
  // Bu funksionallığı tamamlamaq üçün PDF kitabxanası əlavə etmək lazımdır
  console.log('PDF export functionality will be implemented later');
  throw new Error('PDF export functionality is not implemented yet');
};
