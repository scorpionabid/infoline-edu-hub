import * as XLSX from 'xlsx';
import { SchoolColumnData, ExportOptions } from '@/types/report';
import { Column } from '@/types/column';
import { formatDate } from './formatDateUtils';

/**
 * Excel formatında məlumatları export edir
 */
export const exportToExcel = (
  data: SchoolColumnData[],
  columns: Column[],
  options: ExportOptions = {}
) => {
  try {
    const {
      customFileName,
      includeHeaders = true,
      sheetName = 'Məlumatlar',
      excludeColumns = [],
      includeTimestamp = true,
      includeSchoolInfo = true,
      format = 'xlsx',
      filterColumns = []
    } = options;

    // XLSX üçün uyğun format yaratmaq
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    const filteredColumns = columns.filter(col => !excludeColumns.includes(col.id) && 
                                                (filterColumns.length === 0 || filterColumns.includes(col.id)));
    
    // Başlıqlar
    if (includeHeaders) {
      const headers = [];
      
      if (includeSchoolInfo) {
        headers.push('Məktəb ID');
        headers.push('Məktəb Adı');
        headers.push('Region');
        headers.push('Sektor');
      }
      
      filteredColumns.forEach(column => {
        headers.push(column.name);
      });
      
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 0 });
    }
    
    // Məlumatlar
    let rowIndex = includeHeaders ? 1 : 0;
    
    data.forEach(schoolData => {
      const row = [];
      
      if (includeSchoolInfo) {
        row.push(schoolData.schoolId || '');
        row.push(schoolData.schoolName || '');
        row.push(schoolData.region || '');
        row.push(schoolData.sector || '');
      }
      
      filteredColumns.forEach(column => {
        const dataPoint = schoolData.columnData.find(d => d.columnId === column.id);
        
        if (dataPoint) {
          // Xüsusi tip formatlaşdırması
          let cellValue = dataPoint.value;
          
          if (typeof cellValue === 'string' && column.type === 'date' && cellValue) {
            try {
              cellValue = formatDate(cellValue);
            } catch (e) {
              console.error('Date format error:', e);
            }
          }
          
          row.push(cellValue ?? '');
        } else {
          row.push('');
        }
      });
      
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: rowIndex++ });
    });
    
    // Workbook yaratmaq
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Fayl adını təyin etmək
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    const fileName = `${customFileName || 'export'}${timestamp}.${format}`;
    
    // Excel faylını yaratmaq və yükləmək
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error };
  }
};

/**
 * Excel formatındakı məlumatları idxal edir
 */
export const importFromExcel = async (
  file: File,
  columns: Column[],
  options: {
    headerRow?: number;
    startCol?: number;
  } = {}
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> => {
  try {
    const { headerRow = 0, startCol = 0 } = options;
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            return resolve({
              success: false,
              error: 'Excel faylı oxunarkən xəta baş verdi.'
            });
          }
          
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Məlumatları massiv kimi almaq
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            blankrows: false
          });
          
          if (!Array.isArray(jsonData) || jsonData.length <= headerRow) {
            return resolve({
              success: false,
              error: 'Excel faylında məlumatlar tapılmadı.'
            });
          }
          
          // Məlumatları emal etmək
          const headers = jsonData[headerRow] as string[];
          if (!headers || headers.length === 0) {
            return resolve({
              success: false,
              error: 'Excel faylında başlıqlar tapılmadı.'
            });
          }
          
          const processedData = [];
          
          // Məlumat sətirləri üçün
          for (let rowIndex = headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
            const row = jsonData[rowIndex] as any[];
            if (!row || row.length === 0) continue;
            
            const rowData: Record<string, any> = {};
            
            // Hər bir sütun üçün məlumatları emal etmək
            for (let colIndex = startCol; colIndex < headers.length; colIndex++) {
              const header = headers[colIndex];
              if (!header) continue;
              
              // Müvafiq sütunu tapmaq
              const matchingColumn = columns.find(col => col.name === header);
              if (!matchingColumn) continue;
              
              let cellValue = row[colIndex];
              
              // Məlumat tipinə görə düzəlişlər etmək
              if (cellValue !== null && cellValue !== undefined) {
                switch (matchingColumn.type) {
                  case 'number':
                    cellValue = typeof cellValue === 'number' ? 
                      cellValue : 
                      (parseFloat(String(cellValue)) || null);
                    break;
                  case 'date':
                    if (typeof cellValue === 'string') {
                      try {
                        const dateValue = new Date(cellValue);
                        if (!isNaN(dateValue.getTime())) {
                          cellValue = dateValue.toISOString();
                        }
                      } catch (e) {
                        console.error('Date parse error:', e);
                      }
                    } else if (typeof cellValue === 'number') {
                      // Excel date conversions
                      try {
                        const dateValue = new Date((cellValue - 25569) * 86400 * 1000);
                        if (!isNaN(dateValue.getTime())) {
                          cellValue = dateValue.toISOString();
                        }
                      } catch (e) {
                        console.error('Excel date conversion error:', e);
                      }
                    }
                    break;
                  case 'boolean':
                    if (typeof cellValue === 'string') {
                      cellValue = cellValue.toLowerCase() === 'true' || 
                                 cellValue === '1' || 
                                 cellValue.toLowerCase() === 'yes';
                    } else if (typeof cellValue === 'number') {
                      cellValue = cellValue === 1;
                    }
                    break;
                  default:
                    cellValue = String(cellValue);
                }
              }
              
              // Validasiya
              const validationResult = validateCellValue(cellValue, matchingColumn);
              if (!validationResult.valid) {
                console.warn(`Sətir ${rowIndex + 1}, Sütun "${header}": ${validationResult.message}`);
                // Xəta olduqda null əlavə edirik (istədiyiniz davranışdan asılı olaraq dəyişə bilər)
                cellValue = null;
              }
              
              rowData[matchingColumn.id] = cellValue;
            }
            
            processedData.push(rowData);
          }
          
          resolve({
            success: true,
            data: processedData
          });
        } catch (err) {
          console.error('Excel import error:', err);
          resolve({
            success: false,
            error: `Excel faylı emal edilərkən xəta: ${err instanceof Error ? err.message : String(err)}`
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Excel faylı oxunarkən xəta baş verdi.'
        });
      };
      
      reader.readAsBinaryString(file);
    });
  } catch (error) {
    console.error('Excel import function error:', error);
    return {
      success: false,
      error: `Excel idxalı zamanı xəta: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Hüceyrə dəyərini validasiya edir
 */
function validateCellValue(value: any, column: Column): { valid: boolean; message?: string } {
  if (column.isRequired && (value === null || value === undefined || value === '')) {
    return { valid: false, message: `${column.name} sütunu məcburidir.` };
  }
  
  if (value === null || value === undefined || value === '') {
    return { valid: true };
  }
  
  if (column.validationRules) {
    const { validationRules } = column;
    
    if (column.type === 'number' && typeof value === 'number') {
      if (validationRules.minValue !== undefined && value < validationRules.minValue) {
        return { valid: false, message: `Dəyər ${validationRules.minValue} və ya daha böyük olmalıdır.` };
      }
      
      if (validationRules.maxValue !== undefined && value > validationRules.maxValue) {
        return { valid: false, message: `Dəyər ${validationRules.maxValue} və ya daha kiçik olmalıdır.` };
      }
    }
    
    if (column.type === 'text' && typeof value === 'string') {
      if (validationRules.minLength !== undefined && value.length < validationRules.minLength) {
        return { valid: false, message: `Mətn uzunluğu ən az ${validationRules.minLength} simvol olmalıdır.` };
      }
      
      if (validationRules.maxLength !== undefined && value.length > validationRules.maxLength) {
        return { valid: false, message: `Mətn uzunluğu ən çox ${validationRules.maxLength} simvol olmalıdır.` };
      }
      
      if (validationRules.regex && !new RegExp(validationRules.regex).test(value)) {
        return { valid: false, message: 'Mətn tələb olunan formatda deyil.' };
      }
    }
    
    if (column.type === 'date' && typeof value === 'string') {
      const date = new Date(value);
      
      if (isNaN(date.getTime())) {
        return { valid: false, message: 'Keçərli tarix formatı deyil.' };
      }
      
      if (validationRules.minDate && date < new Date(validationRules.minDate)) {
        return { valid: false, message: `Tarix ${validationRules.minDate} və ya daha sonra olmalıdır.` };
      }
      
      if (validationRules.maxDate && date > new Date(validationRules.maxDate)) {
        return { valid: false, message: `Tarix ${validationRules.maxDate} və ya daha əvvəl olmalıdır.` };
      }
    }
    
    // Other validations can be added
  }
  
  return { valid: true };
}
