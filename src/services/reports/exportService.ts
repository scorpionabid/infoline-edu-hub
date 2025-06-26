import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

export interface ExportData {
  [key: string]: any;
}

export interface ExportColumn {
  key: string;
  title: string;
  width?: number;
}

export interface ExportOptions {
  fileName?: string;
  includeMetadata?: boolean;
  customTitle?: string;
  timestamp?: boolean;
}

/**
 * Excel ixracı üçün optimal servis
 */
export class ExcelExportService {
  static async exportToExcel(
    data: ExportData[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const fileName = options.fileName || `export-${new Date().toISOString().split('T')[0]}`;
      
      // Worksheet data hazırlığı
      const worksheetData: any[][] = [];
      
      // Metadata əlavə etmək (əgər tələb olunarsa)
      if (options.includeMetadata) {
        worksheetData.push(['İnfoLine Hesabat İxracı']);
        worksheetData.push(['Tarix:', new Date().toLocaleString('az-AZ')]);
        worksheetData.push(['Məlumat sayı:', data.length.toString()]);
        worksheetData.push([]); // Boş sətir
      }
      
      // Başlıqlar
      const headers = columns.map(col => col.title);
      worksheetData.push(headers);
      
      // Məlumatlar
      data.forEach(row => {
        const rowData = columns.map(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return value.toString();
        });
        worksheetData.push(rowData);
      });
      
      // Worksheet yaradma
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Sütun genişliklərini təyin etmə
      const columnWidths = columns.map(col => ({
        wch: col.width || 15
      }));
      worksheet['!cols'] = columnWidths;
      
      // Workbook yaradma
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Fayl yaradma və yükləmə
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true
      });
      
      const fileData = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const finalFileName = `${fileName}.xlsx`;
      saveAs(fileData, finalFileName);
      
      return finalFileName;
    } catch (error) {
      console.error('Excel export xətası:', error);
      throw handleError(error);
    }
  }
}

/**
 * PDF ixracı üçün optimal servis
 */
export class PDFExportService {
  static async exportToPDF(
    data: ExportData[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const fileName = options.fileName || `export-${new Date().toISOString().split('T')[0]}`;
      
      // jsPDF instansı yaradırıq
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Başlıq əlavə etmək
      const title = options.customTitle || 'İnfoLine Hesabat';
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      
      // Metadata əlavə etmək
      if (options.includeMetadata) {
        doc.setFontSize(10);
        doc.text(`Tarix: ${new Date().toLocaleString('az-AZ')}`, 14, 25);
        doc.text(`Məlumat sayı: ${data.length}`, 14, 30);
      }
      
      // Sadə cədvəl yaradırıq (autotable olmadan)
      let yPosition = options.includeMetadata ? 40 : 30;
      const startX = 14;
      const columnWidth = 25;
      
      // Başlıqları yazırıq
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      columns.forEach((col, index) => {
        doc.text(col.title, startX + (index * columnWidth), yPosition);
      });
      
      yPosition += 5;
      doc.setFont(undefined, 'normal');
      
      // Məlumatları yazırıq
      data.forEach((row, rowIndex) => {
        if (yPosition > 180) { // Yeni səhifə
          doc.addPage();
          yPosition = 20;
        }
        
        columns.forEach((col, colIndex) => {
          const value = row[col.key];
          let displayValue = '';
          if (value !== null && value !== undefined) {
            displayValue = typeof value === 'object' 
              ? JSON.stringify(value).substring(0, 20) + '...'
              : value.toString().substring(0, 20);
          }
          doc.text(displayValue, startX + (colIndex * columnWidth), yPosition);
        });
        
        yPosition += 4;
      });
      
      // PDF faylını yükləmə
      const finalFileName = `${fileName}.pdf`;
      doc.save(finalFileName);
      
      return finalFileName;
    } catch (error) {
      console.error('PDF export xətası:', error);
      throw handleError(error);
    }
  }
}

/**
 * CSV ixracı üçün optimal servis
 */
export class CSVExportService {
  static async exportToCSV(
    data: ExportData[], 
    columns: ExportColumn[], 
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const fileName = options.fileName || `export-${new Date().toISOString().split('T')[0]}`;
      
      // CSV məzmununu yaradırıq
      let csvContent = '';
      
      // Metadata əlavə etmək (əgər tələb olunarsa)
      if (options.includeMetadata) {
        csvContent += `"İnfoLine Hesabat İxracı"\n`;
        csvContent += `"Tarix","${new Date().toLocaleString('az-AZ')}"\n`;
        csvContent += `"Məlumat sayı","${data.length}"\n`;
        csvContent += `\n`; // Boş sətir
      }
      
      // Başlıqlar
      const headers = columns.map(col => `"${col.title.replace(/"/g, '""')}"`);
      csvContent += headers.join(',') + '\n';
      
      // Məlumatlar
      data.forEach(row => {
        const rowData = columns.map(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return '""';
          
          let stringValue = '';
          if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          } else {
            stringValue = value.toString();
          }
          
          // CSV üçün escape etmək
          return `"${stringValue.replace(/"/g, '""')}"`;
        });
        csvContent += rowData.join(',') + '\n';
      });
      
      // Blob yaradırıq
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      
      // Faylı yükləyirik
      const finalFileName = `${fileName}.csv`;
      saveAs(blob, finalFileName);
      
      return finalFileName;
    } catch (error) {
      console.error('CSV export xətası:', error);
      throw handleError(error);
    }
  }
}

/**
 * Verilənləri məlumat bazasından export üçün hazırlayan servis
 */
export class ReportDataService {
  /**
   * Məktəb performans hesabatı üçün məlumat hazırlayır
   */
  static async getSchoolPerformanceData(filters: {
    region_id?: string;
    sector_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}): Promise<{ data: ExportData[], columns: ExportColumn[] }> {
    try {
      const { data, error } = await supabase.rpc('get_school_performance_report', {
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null,
        p_date_from: filters.date_from || null,
        p_date_to: filters.date_to || null
      });
      
      if (error) throw error;
      
      const columns: ExportColumn[] = [
        { key: 'school_name', title: 'Məktəb Adı', width: 25 },
        { key: 'region_name', title: 'Region', width: 15 },
        { key: 'sector_name', title: 'Sektor', width: 15 },
        { key: 'completion_rate', title: 'Tamamlanma %', width: 12 },
        { key: 'total_entries', title: 'Ümumi Daxiletmə', width: 12 },
        { key: 'approved_entries', title: 'Təsdiqlənmiş', width: 12 },
        { key: 'pending_entries', title: 'Gözləyən', width: 10 },
        { key: 'rejected_entries', title: 'Rədd edilmiş', width: 12 }
      ];
      
      return { data: data || [], columns };
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Regional müqayisə hesabatı üçün məlumat hazırlayır
   */
  static async getRegionalComparisonData(): Promise<{ data: ExportData[], columns: ExportColumn[] }> {
    try {
      const { data, error } = await supabase.rpc('get_regional_comparison_report');
      
      if (error) throw error;
      
      const columns: ExportColumn[] = [
        { key: 'region_name', title: 'Region Adı', width: 20 },
        { key: 'total_schools', title: 'Məktəb Sayı', width: 12 },
        { key: 'avg_completion_rate', title: 'Ortalama Tamamlanma %', width: 18 },
        { key: 'total_data_entries', title: 'Ümumi Daxiletmə', width: 15 },
        { key: 'approved_percentage', title: 'Təsdiqlənmə %', width: 15 },
        { key: 'performance_score', title: 'Performans Balı', width: 15 }
      ];
      
      return { data: data || [], columns };
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Kategory əsaslı hesabat üçün məlumat hazırlayır
   */
  static async getCategoryCompletionData(categoryId: string): Promise<{ data: ExportData[], columns: ExportColumn[] }> {
    try {
      const { data, error } = await supabase.rpc('get_category_completion_report', {
        p_category_id: categoryId
      });
      
      if (error) throw error;
      
      const columns: ExportColumn[] = [
        { key: 'school_name', title: 'Məktəb Adı', width: 25 },
        { key: 'region_name', title: 'Region', width: 15 },
        { key: 'sector_name', title: 'Sektor', width: 15 },
        { key: 'category_name', title: 'Kateqoriya', width: 20 },
        { key: 'required_columns', title: 'Məcburi Sütunlar', width: 15 },
        { key: 'filled_columns', title: 'Doldurulmuş', width: 12 },
        { key: 'completion_percentage', title: 'Tamamlanma %', width: 15 },
        { key: 'status', title: 'Status', width: 12 }
      ];
      
      return { data: data || [], columns };
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Məktəb sütun məlumatları üçün export hazırlayır
   */
  static async getSchoolColumnData(filters: {
    category_id?: string;
    region_id?: string;
    sector_id?: string;
  } = {}): Promise<{ data: ExportData[], columns: ExportColumn[] }> {
    try {
      const { data, error } = await supabase.rpc('get_school_column_export_data', {
        p_category_id: filters.category_id || null,
        p_region_id: filters.region_id || null,
        p_sector_id: filters.sector_id || null
      });
      
      if (error) throw error;
      
      // Dinamik sütunlar yaradırıq
      const staticColumns: ExportColumn[] = [
        { key: 'school_name', title: 'Məktəb Adı', width: 25 },
        { key: 'region_name', title: 'Region', width: 15 },
        { key: 'sector_name', title: 'Sektor', width: 15 },
        { key: 'status', title: 'Status', width: 12 }
      ];
      
      // Dinamik sütunları əlavə edirik (əgər məlumatda column məlumatları varsa)
      const dynamicColumns: ExportColumn[] = [];
      if (data && data.length > 0) {
        const firstRow = data[0];
        Object.keys(firstRow).forEach(key => {
          if (key.startsWith('column_')) {
            const columnTitle = key.replace('column_', '').replace(/_/g, ' ');
            dynamicColumns.push({
              key,
              title: columnTitle,
              width: 15
            });
          }
        });
      }
      
      const allColumns = [...staticColumns, ...dynamicColumns];
      
      return { data: data || [], columns: allColumns };
    } catch (error) {
      throw handleError(error);
    }
  }
}

/**
 * Bütün export növlərini birləşdirən ana servis
 */
export class ReportExportService {
  /**
   * Məktəb performans hesabatını export edir
   */
  static async exportSchoolPerformance(
    format: 'excel' | 'pdf' | 'csv',
    filters: any = {},
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const { data, columns } = await ReportDataService.getSchoolPerformanceData(filters);
      
      const exportOptions: ExportOptions = {
        fileName: `school-performance-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        customTitle: 'Məktəb Performans Hesabatı',
        ...options
      };
      
      switch (format) {
        case 'excel': {
          return await ExcelExportService.exportToExcel(data, columns, exportOptions);
        case 'pdf': {
          return await PDFExportService.exportToPDF(data, columns, exportOptions);
        case 'csv': {
          return await CSVExportService.exportToCSV(data, columns, exportOptions);
        default:
          throw new Error(`Dəstəklənməyən format: ${format}`);
      }
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Regional müqayisə hesabatını export edir
   */
  static async exportRegionalComparison(
    format: 'excel' | 'pdf' | 'csv',
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const { data, columns } = await ReportDataService.getRegionalComparisonData();
      
      const exportOptions: ExportOptions = {
        fileName: `regional-comparison-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        customTitle: 'Regional Müqayisə Hesabatı',
        ...options
      };
      
      switch (format) {
        case 'excel': {
          return await ExcelExportService.exportToExcel(data, columns, exportOptions);
        case 'pdf': {
          return await PDFExportService.exportToPDF(data, columns, exportOptions);
        case 'csv': {
          return await CSVExportService.exportToCSV(data, columns, exportOptions);
        default:
          throw new Error(`Dəstəklənməyən format: ${format}`);
      }
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Kategory tamamlanma hesabatını export edir
   */
  static async exportCategoryCompletion(
    categoryId: string,
    format: 'excel' | 'pdf' | 'csv',
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const { data, columns } = await ReportDataService.getCategoryCompletionData(categoryId);
      
      const exportOptions: ExportOptions = {
        fileName: `category-completion-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        customTitle: 'Kateqoriya Tamamlanma Hesabatı',
        ...options
      };
      
      switch (format) {
        case 'excel': {
          return await ExcelExportService.exportToExcel(data, columns, exportOptions);
        case 'pdf': {
          return await PDFExportService.exportToPDF(data, columns, exportOptions);
        case 'csv': {
          return await CSVExportService.exportToCSV(data, columns, exportOptions);
        default:
          throw new Error(`Dəstəklənməyən format: ${format}`);
      }
    } catch (error) {
      throw handleError(error);
    }
  }
  
  /**
   * Məktəb sütun məlumatlarını export edir
   */
  static async exportSchoolColumnData(
    filters: any = {},
    format: 'excel' | 'pdf' | 'csv',
    options: ExportOptions = {}
  ): Promise<string> {
    try {
      const { data, columns } = await ReportDataService.getSchoolColumnData(filters);
      
      const exportOptions: ExportOptions = {
        fileName: `school-column-data-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        customTitle: 'Məktəb Sütun Məlumatları',
        ...options
      };
      
      switch (format) {
        case 'excel': {
          return await ExcelExportService.exportToExcel(data, columns, exportOptions);
        case 'pdf': {
          return await PDFExportService.exportToPDF(data, columns, exportOptions);
        case 'csv': {
          return await CSVExportService.exportToCSV(data, columns, exportOptions);
        default:
          throw new Error(`Dəstəklənməyən format: ${format}`);
      }
    } catch (error) {
      throw handleError(error);
    }
  }
}

// Default export
export default ReportExportService;
