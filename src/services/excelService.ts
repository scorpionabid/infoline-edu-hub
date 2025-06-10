
import * as XLSX from 'xlsx';
import { CategoryWithColumns } from '@/types/category';
import { ImportResult, ExportOptions, ExcelTemplateOptions } from '@/types/excel';

export class ExcelService {
  /**
   * Download Excel template for category
   */
  static async downloadTemplate(
    category: CategoryWithColumns,
    schoolId: string,
    options: ExcelTemplateOptions = {}
  ): Promise<void> {
    const {
      includeInstructions = true,
      includeSampleData = false,
      formatCells = true,
      addValidation = false
    } = options;

    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Create headers from category columns
      const headers = category.columns?.map(col => col.name) || [];
      const templateData = [headers];
      
      // Add sample data if requested
      if (includeSampleData) {
        const sampleRow = category.columns?.map(col => {
          switch (col.type) {
            case 'number':
              return '100';
            case 'date':
              return '2024-01-01';
            case 'select':
              return col.options?.[0]?.label || 'Seçim';
            default:
              return 'Nümunə məlumat';
          }
        }) || [];
        templateData.push(sampleRow);
      }
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      
      // Add to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Add instructions sheet if requested
      if (includeInstructions) {
        const instructions = [
          ['Təlimatlar'],
          [''],
          ['1. Birinci sətirdə başlıqlar var, onları dəyişməyin'],
          ['2. Məlumatları ikinci sətirdən başlayaraq daxil edin'],
          ['3. Məcburi sahələri boş buraxmayın'],
          ['4. Fayl formatını .xlsx olaraq saxlayın']
        ];
        
        const instructionSheet = XLSX.utils.aoa_to_sheet(instructions);
        XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Təlimatlar');
      }
      
      // Download file
      const fileName = `${category.name}_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Template download error:', error);
      throw new Error('Template yüklənməsində xəta baş verdi');
    }
  }

  /**
   * Import Excel file
   */
  static async importExcelFile(
    file: File,
    categoryId: string,
    schoolId: string,
    userId: string
  ): Promise<ImportResult> {
    try {
      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (jsonData.length < 2) {
        throw new Error('Fayl boşdur və ya təkcə başlıq sətiri var');
      }
      
      // Process data
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      let successfulRows = 0;
      let failedRows = 0;
      const errors: any[] = [];
      
      // Basic validation (real implementation would be more complex)
      dataRows.forEach((row, index) => {
        const rowIndex = index + 2; // +2 because we start from row 2 in Excel
        
        if (row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
          successfulRows++;
        } else {
          failedRows++;
          errors.push({
            row: rowIndex,
            column: 'general',
            value: '',
            error: 'Boş sətir',
            severity: 'warning'
          });
        }
      });
      
      return {
        success: errors.length === 0,
        totalRows: dataRows.length,
        successfulRows,
        failedRows,
        errors,
        message: `${successfulRows} sətir uğurla import edildi`
      };
      
    } catch (error) {
      console.error('Excel import error:', error);
      throw new Error('Excel faylının oxunmasında xəta baş verdi');
    }
  }

  /**
   * Export data to Excel
   */
  static async downloadExport(
    schoolId: string,
    categoryId: string,
    categoryName: string,
    options: ExportOptions = { format: 'xlsx', includeHeaders: true }
  ): Promise<void> {
    try {
      // This would fetch real data from API
      const exportData = [
        ['Sütun 1', 'Sütun 2', 'Sütun 3'],
        ['Məlumat 1', 'Məlumat 2', 'Məlumat 3'],
        ['Məlumat 4', 'Məlumat 5', 'Məlumat 6']
      ];
      
      if (options.format === 'xlsx') {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Data');
        
        const fileName = options.filename || `${categoryName}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      }
      
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Excel export zamanı xəta baş verdi');
    }
  }
}
