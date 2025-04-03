
import * as XLSX from 'xlsx';

export interface ExportOptions {
  customFileName?: string;
  includeHeaders?: boolean;
  sheetName?: string;
}

export const exportDataToExcel = <T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void => {
  if (!data || data.length === 0) {
    console.warn('Eksport etmək üçün məlumat yoxdur');
    return;
  }

  try {
    const {
      customFileName = 'export',
      includeHeaders = true,
      sheetName = 'Data'
    } = options;

    const workbook = XLSX.utils.book_new();
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Convert data to array of arrays
    const rows = data.map(item => Object.values(item));
    
    // Add headers to worksheet if includeHeaders is true
    const wsData = includeHeaders ? [headers, ...rows] : rows;
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    
    XLSX.writeFile(workbook, `${customFileName}.xlsx`);
  } catch (error) {
    console.error('Excel eksport xətası:', error);
  }
};

export const importDataFromExcel = async (
  file: File
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '', // Default value for empty cells
          raw: false  // Return formatted text values  
        });
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const generateExcelTemplate = (
  headers: string[],
  options: ExportOptions = {}
): void => {
  const {
    customFileName = 'template',
    sheetName = 'Template'
  } = options;

  const workbook = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers]);
  
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  XLSX.writeFile(workbook, `${customFileName}.xlsx`);
};
