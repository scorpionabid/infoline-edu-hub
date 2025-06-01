import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns, Column } from '@/types/category';
import {
  ExcelTemplateOptions,
  ImportResult,
  ImportError,
  ExportOptions,
  ValidationResult,
  EXCEL_CONSTRAINTS
} from '@/types/excel';

// Import types from dataEntryService
interface EntryValue {
  columnId: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
}

/**
 * Enhanced Excel Service for InfoLine
 * Handles all Excel-related operations including template generation,
 * data import/export, validation, and bulk processing
 */
export class ExcelService {
  
  /**
   * Generate advanced Excel template with validation rules
   */
  static async generateTemplate(
    category: CategoryWithColumns,
    schoolId?: string,
    options: ExcelTemplateOptions = {}
  ): Promise<Blob> {
    try {
      console.log('Generating Excel template for category:', category.name);
      
      const {
        includeInstructions = true,
        includeSampleData = true,
        formatCells = true,
        addValidation = true
      } = options;

      // Create new workbook
      const workbook = XLSX.utils.book_new();
      
      // Prepare main data sheet
      const mainSheetData = await this.createMainSheet(category, includeSampleData);
      const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
      
      // Format cells if requested
      if (formatCells) {
        this.formatSheet(mainSheet, category.columns);
      }
      
      // Add data validation if requested
      if (addValidation) {
        this.addDataValidation(mainSheet, category.columns);
      }
      
      // Add main sheet to workbook
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Data Entry');
      
      // Add instructions sheet if requested
      if (includeInstructions) {
        const instructionsSheet = this.createInstructionsSheet(category);
        XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      }
      
      // Convert to blob
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true,
        sheetStubs: false
      });
      
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      console.log('Template generated successfully');
      return blob;
      
    } catch (error) {
      console.error('Error generating Excel template:', error);
      throw new Error(`Template generation failed: ${error.message}`);
    }
  }
  
  /**
   * Import Excel file with comprehensive validation and error handling
   */
  static async importExcelFile(
    file: File,
    categoryId: string,
    schoolId: string,
    userId: string
  ): Promise<ImportResult> {
    const importId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log('Starting Excel import:', { file: file.name, categoryId, schoolId });
      
      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return {
          success: false,
          totalRows: 0,
          successfulRows: 0,
          failedRows: 0,
          errors: fileValidation.errors,
          message: 'File validation failed'
        };
      }
      
      // Get category information
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select(`
          *,
          columns:columns(*)
        `)
        .eq('id', categoryId)
        .single();
        
      if (categoryError || !category) {
        throw new Error('Category not found or invalid');
      }
      
      // Parse Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        return {
          success: false,
          totalRows: 0,
          successfulRows: 0,
          failedRows: 0,
          errors: [{ row: 1, column: 'general', value: '', error: 'File contains no data rows', severity: 'error' }],
          message: 'No data to import'
        };
      }
      
      // Extract headers and data rows
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      // Create import history record
      const { data: importRecord, error: importRecordError } = await supabase
        .from('excel_import_history')
        .insert({
          id: importId,
          school_id: schoolId,
          category_id: categoryId,
          file_name: file.name,
          file_size: file.size,
          imported_by: userId,
          status: 'processing',
          total_rows: dataRows.length
        })
        .select()
        .single();
        
      if (importRecordError) {
        console.warn('Could not create import record:', importRecordError);
      }
      
      // Map headers to column IDs
      const columnMap = this.mapHeadersToColumns(headers, category.columns);
      
      // Validate and process data
      const validationResult = this.validateImportData(dataRows, headers, category.columns, columnMap);
      
      if (validationResult.errors.length > 0 && validationResult.errors.some(e => e.severity === 'error')) {
        // Update import record with errors
        await supabase
          .from('excel_import_history')
          .update({
            status: 'failed',
            successful_rows: 0,
            failed_rows: dataRows.length,
            error_log: { errors: validationResult.errors }
          })
          .eq('id', importId);
          
        return {
          success: false,
          totalRows: dataRows.length,
          successfulRows: 0,
          failedRows: dataRows.length,
          errors: validationResult.errors,
          importId,
          message: 'Data validation failed'
        };
      }
      
      // Process valid rows
      const processResult = await this.processBulkImport(
        dataRows,
        headers,
        columnMap,
        categoryId,
        schoolId,
        userId
      );
      
      // Update import record with final status
      await supabase
        .from('excel_import_history')
        .update({
          status: processResult.success ? 'completed' : 'partial',
          successful_rows: processResult.successfulRows,
          failed_rows: processResult.failedRows,
          error_log: { 
            errors: processResult.errors,
            warnings: validationResult.warnings 
          }
        })
        .eq('id', importId);
      
      console.log('Import completed:', processResult);
      return {
        ...processResult,
        importId,
        totalRows: dataRows.length
      };
      
    } catch (error) {
      console.error('Excel import failed:', error);
      
      // Update import record with error
      await supabase
        .from('excel_import_history')
        .update({
          status: 'failed',
          error_log: { error: error.message }
        })
        .eq('id', importId);
      
      return {
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [{ row: 0, column: 'general', value: '', error: error.message, severity: 'error' }],
        importId,
        message: 'Import process failed'
      };
    }
  }
  
  /**
   * Export data to Excel with formatting options
   */
  static async exportData(
    schoolId: string,
    categoryId: string,
    options: ExportOptions = {}
  ): Promise<Blob> {
    try {
      console.log('Exporting data:', { schoolId, categoryId, options });
      
      const {
        format = 'xlsx',
        includeMetadata = true,
        filterByStatus = [],
        includeHeaders = true
      } = options;
      
      // Get category and data
      const { data: category } = await supabase
        .from('categories')
        .select(`
          *,
          columns:columns(*)
        `)
        .eq('id', categoryId)
        .single();
        
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Get data entries with filtering
      let query = supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('category_id', categoryId);
        
      if (filterByStatus.length > 0) {
        query = query.in('status', filterByStatus);
      }
      
      const { data: entries } = await query;
      
      // Prepare export data
      const exportData = this.prepareExportData(entries || [], category.columns, includeHeaders);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      
      // Add metadata sheet if requested
      if (includeMetadata) {
        const metadataSheet = this.createMetadataSheet(category, schoolId);
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Generate file
      const buffer = XLSX.write(workbook, { 
        bookType: format === 'csv' ? 'csv' : 'xlsx', 
        type: 'array' 
      });
      
      const mimeType = format === 'csv' 
        ? 'text/csv' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
      return new Blob([buffer], { type: mimeType });
      
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }
  
  /**
   * Download template file
   */
  static async downloadTemplate(
    category: CategoryWithColumns,
    schoolId?: string,
    options?: ExcelTemplateOptions
  ): Promise<void> {
    try {
      const blob = await this.generateTemplate(category, schoolId, options);
      const fileName = `${category.name}_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Template download failed:', error);
      throw error;
    }
  }
  
  /**
   * Download exported data
   */
  static async downloadExport(
    schoolId: string,
    categoryId: string,
    categoryName: string,
    options?: ExportOptions
  ): Promise<void> {
    try {
      const blob = await this.exportData(schoolId, categoryId, options);
      const extension = options?.format === 'csv' ? 'csv' : 'xlsx';
      const fileName = `${categoryName}_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Export download failed:', error);
      throw error;
    }
  }
  
  // Private helper methods
  
  private static async createMainSheet(
    category: CategoryWithColumns,
    includeSampleData: boolean
  ): Promise<any[][]> {
    const headers = category.columns.map(col => {
      let header = col.name;
      if (col.is_required) {
        header += ' *';
      }
      return header;
    });
    
    const data = [headers];
    
    // Add sample data if requested
    if (includeSampleData) {
      const sampleRow = category.columns.map(col => this.generateSampleValue(col));
      data.push(sampleRow);
      data.push(new Array(category.columns.length).fill('')); // Empty row
    }
    
    return data;
  }
  
  private static generateSampleValue(column: Column): string {
    switch (column.type) {
      case 'text':
        return 'Sample text';
      case 'number':
        return '100';
      case 'date':
        return new Date().toISOString().split('T')[0];
      case 'select':
        const options = column.options as any[];
        return options && options.length > 0 ? options[0].value || options[0] : 'Option 1';
      case 'checkbox':
        return 'Yes';
      default:
        return 'Sample value';
    }
  }
  
  private static formatSheet(sheet: XLSX.WorkSheet, columns: Column[]): void {
    // Add column formatting based on data types
    columns.forEach((col, index) => {
      const colLetter = XLSX.utils.encode_col(index);
      
      // Format header
      const headerCell = `${colLetter}1`;
      if (!sheet[headerCell]) sheet[headerCell] = { t: 's', v: col.name };
      sheet[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: col.is_required ? 'FFCCCB' : 'E6E6FA' } },
        alignment: { horizontal: 'center' }
      };
      
      // Set column width
      if (!sheet['!cols']) sheet['!cols'] = [];
      sheet['!cols'][index] = { wch: Math.max(col.name.length + 5, 15) };
    });
  }
  
  private static addDataValidation(sheet: XLSX.WorkSheet, columns: Column[]): void {
    // Add data validation rules for dropdowns, date formats, etc.
    columns.forEach((col, index) => {
      if (col.type === 'select' && col.options) {
        const colLetter = XLSX.utils.encode_col(index);
        const options = Array.isArray(col.options) 
          ? col.options.map(opt => typeof opt === 'string' ? opt : opt.value || opt.label).join(',')
          : String(col.options);
          
        // Add validation (this is a simplified approach - full implementation would use proper Excel validation)
        const range = `${colLetter}2:${colLetter}1000`;
        if (!sheet['!dataValidation']) sheet['!dataValidation'] = [];
        sheet['!dataValidation'].push({
          type: 'list',
          formula1: `"${options}"`,
          sqref: range
        });
      }
    });
  }
  
  private static createInstructionsSheet(category: CategoryWithColumns): XLSX.WorkSheet {
    const instructions = [
      ['İnfoLine - Excel Import Instructions'],
      [''],
      ['Category:', category.name],
      ['Description:', category.description || 'No description'],
      [''],
      ['Column Information:'],
      ['Column Name', 'Type', 'Required', 'Description', 'Valid Values'],
      ...category.columns.map(col => [
        col.name,
        col.type,
        col.is_required ? 'Yes' : 'No',
        col.help_text || '',
        col.type === 'select' && col.options 
          ? Array.isArray(col.options) 
            ? col.options.map(opt => typeof opt === 'string' ? opt : opt.value || opt.label).join(', ')
            : String(col.options)
          : ''
      ]),
      [''],
      ['Important Notes:'],
      ['• Fields marked with * are required'],
      ['• Use exact format shown in sample data'],
      ['• Date format: YYYY-MM-DD'],
      ['• For dropdown fields, use only the values listed'],
      ['• Leave empty cells blank, do not use spaces'],
      ['• Save file as .xlsx format before importing']
    ];
    
    return XLSX.utils.aoa_to_sheet(instructions);
  }
  
  private static validateFile(file: File): ValidationResult {
    const errors: ImportError[] = [];
    
    // Check file type using constants
    if (!EXCEL_CONSTRAINTS.SUPPORTED_MIME_TYPES.includes(file.type) && 
        !EXCEL_CONSTRAINTS.SUPPORTED_FORMATS.some(format => file.name.toLowerCase().endsWith(format))) {
      errors.push({
        row: 0,
        column: 'file',
        value: file.name,
        error: 'Invalid file type. Please use .xlsx, .xls, or .csv files.',
        severity: 'error'
      });
    }
    
    // Check file size using constants
    if (file.size > EXCEL_CONSTRAINTS.MAX_FILE_SIZE) {
      errors.push({
        row: 0,
        column: 'file',
        value: file.size,
        error: `File size exceeds ${EXCEL_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
  
  private static mapHeadersToColumns(headers: string[], columns: Column[]): Map<string, Column> {
    const map = new Map<string, Column>();
    
    headers.forEach((header, index) => {
      // Clean header (remove required indicator)
      const cleanHeader = header.replace(/\s*\*\s*$/, '').trim();
      
      // Find matching column
      const column = columns.find(col => 
        col.name.toLowerCase() === cleanHeader.toLowerCase() ||
        col.name.replace(/\s+/g, '').toLowerCase() === cleanHeader.replace(/\s+/g, '').toLowerCase()
      );
      
      if (column) {
        map.set(String(index), column);
      }
    });
    
    return map;
  }
  
  private static validateImportData(
    dataRows: any[][],
    headers: string[],
    columns: Column[],
    columnMap: Map<string, Column>
  ): ValidationResult {
    const errors: ImportError[] = [];
    const warnings: ImportError[] = [];
    
    dataRows.forEach((row, rowIndex) => {
      const actualRowNumber = rowIndex + 2; // +1 for 0-based index, +1 for header row
      
      headers.forEach((header, colIndex) => {
        const column = columnMap.get(String(colIndex));
        if (!column) return;
        
        const value = row[colIndex];
        
        // Check required fields
        if (column.is_required && (value === undefined || value === null || value === '')) {
          errors.push({
            row: actualRowNumber,
            column: column.name,
            value,
            error: 'Required field is empty',
            severity: 'error'
          });
        }
        
        // Validate data type if value is not empty
        if (value !== undefined && value !== null && value !== '') {
          const typeValidation = this.validateDataType(value, column.type, column.options);
          if (!typeValidation.isValid) {
            errors.push({
              row: actualRowNumber,
              column: column.name,
              value,
              error: typeValidation.error,
              severity: 'error'
            });
          }
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private static validateDataType(value: any, type: string, options?: any): { isValid: boolean; error?: string } {
    switch (type) {
      case 'number':
        if (isNaN(Number(value))) {
          return { isValid: false, error: 'Value must be a number' };
        }
        break;
        
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return { isValid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
        }
        break;
        
      case 'select':
        if (options && Array.isArray(options)) {
          const validValues = options.map(opt => typeof opt === 'string' ? opt : opt.value || opt.label);
          if (!validValues.includes(String(value))) {
            return { isValid: false, error: `Value must be one of: ${validValues.join(', ')}` };
          }
        }
        break;
        
      case 'checkbox':
        const validCheckboxValues = ['yes', 'no', 'true', 'false', '1', '0', 'bəli', 'xeyr'];
        if (!validCheckboxValues.includes(String(value).toLowerCase())) {
          return { isValid: false, error: 'Value must be Yes/No, True/False, or 1/0' };
        }
        break;
    }
    
    return { isValid: true };
  }
  
  private static async processBulkImport(
    dataRows: any[][],
    headers: string[],
    columnMap: Map<string, Column>,
    categoryId: string,
    schoolId: string,
    userId: string
  ): Promise<ImportResult> {
    const errors: ImportError[] = [];
    let successfulRows = 0;
    let failedRows = 0;
    
    try {
      // Delete existing entries for this category and school
      const { error: deleteError } = await supabase
        .from('data_entries')
        .delete()
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
        
      if (deleteError) {
        throw new Error(`Failed to clear existing data: ${deleteError.message}`);
      }
      
      // Process each row
      for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
        const row = dataRows[rowIndex];
        const actualRowNumber = rowIndex + 2;
        
        try {
          // Skip empty rows
          if (row.every(cell => cell === undefined || cell === null || cell === '')) {
            continue;
          }
          
          // Create entries for this row
          const entries: EntryValue[] = [];
          
          headers.forEach((header, colIndex) => {
            const column = columnMap.get(String(colIndex));
            if (column && row[colIndex] !== undefined && row[colIndex] !== null && row[colIndex] !== '') {
              entries.push({
                columnId: column.id,
                value: this.normalizeValue(row[colIndex], column.type)
              });
            }
          });
          
          // Insert entries for this row
          if (entries.length > 0) {
            const insertPromises = entries.map(entry =>
              supabase.from('data_entries').insert({
                school_id: schoolId,
                category_id: categoryId,
                column_id: entry.columnId,
                value: entry.value,
                status: 'draft',
                created_by: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            );
            
            const results = await Promise.all(insertPromises);
            const hasErrors = results.some(result => result.error);
            
            if (hasErrors) {
              failedRows++;
              errors.push({
                row: actualRowNumber,
                column: 'general',
                value: '',
                error: 'Failed to save row data',
                severity: 'error'
              });
            } else {
              successfulRows++;
            }
          }
          
        } catch (error) {
          failedRows++;
          errors.push({
            row: actualRowNumber,
            column: 'general',
            value: '',
            error: error.message || 'Unknown error processing row',
            severity: 'error'
          });
        }
      }
      
      return {
        success: successfulRows > 0,
        totalRows: dataRows.length,
        successfulRows,
        failedRows,
        errors,
        message: successfulRows > 0 
          ? `Successfully imported ${successfulRows} rows${failedRows > 0 ? ` (${failedRows} rows failed)` : ''}`
          : 'Import failed - no rows processed successfully'
      };
      
    } catch (error) {
      return {
        success: false,
        totalRows: dataRows.length,
        successfulRows: 0,
        failedRows: dataRows.length,
        errors: [{ row: 0, column: 'general', value: '', error: error.message, severity: 'error' }],
        message: 'Bulk import process failed'
      };
    }
  }
  
  private static normalizeValue(value: any, type: string): string {
    switch (type) {
      case 'number':
        return String(Number(value));
      case 'date':
        const date = new Date(value);
        return date.toISOString().split('T')[0];
      case 'checkbox':
        const lowerValue = String(value).toLowerCase();
        return ['yes', 'true', '1', 'bəli'].includes(lowerValue) ? 'true' : 'false';
      default:
        return String(value);
    }
  }
  
  private static prepareExportData(
    entries: any[],
    columns: Column[],
    includeHeaders: boolean
  ): any[][] {
    const data: any[][] = [];
    
    if (includeHeaders) {
      const headers = columns.map(col => col.name);
      data.push(headers);
    }
    
    // Group entries by column
    const entriesByColumn = new Map<string, any>();
    entries.forEach(entry => {
      entriesByColumn.set(entry.column_id, entry);
    });
    
    // Create data row
    const row = columns.map(col => {
      const entry = entriesByColumn.get(col.id);
      return entry ? entry.value : '';
    });
    
    if (row.some(cell => cell !== '')) {
      data.push(row);
    }
    
    return data;
  }
  
  private static createMetadataSheet(category: any, schoolId: string): XLSX.WorkSheet {
    const metadata = [
      ['Export Metadata'],
      [''],
      ['Category:', category.name],
      ['School ID:', schoolId],
      ['Export Date:', new Date().toISOString()],
      ['Total Columns:', category.columns.length],
      [''],
      ['Column Details:'],
      ['Name', 'Type', 'Required'],
      ...category.columns.map((col: Column) => [
        col.name,
        col.type,
        col.is_required ? 'Yes' : 'No'
      ])
    ];
    
    return XLSX.utils.aoa_to_sheet(metadata);
  }
}
