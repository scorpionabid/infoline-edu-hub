
import * as XLSX from 'xlsx';

/**
 * Excel faylı yaratmaq və yükləmək üçün yardımçı funksiya
 * @param data Exceldə göstəriləcək məlumatlar
 * @param fileName Faylın adı
 */
export const exportToExcel = (data: any[], fileName: string) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Excel faylı ixrac edilərkən xəta baş verdi');
  }
};

/**
 * Excel şablonu yaratmaq üçün funksiya
 * @param columns Sütunlar
 * @param fileName Faylın adı
 */
export const generateExcelTemplate = (columns: any[], fileName: string) => {
  try {
    // Nümunə məlumatlar yaradaq və sadəcə başlıqları göstərək
    const sampleData = [{}];
    
    // Sütunları əlavə edək
    columns.forEach(column => {
      sampleData[0][column.name] = '';
    });
    
    // Excel faylı yaradaq
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    // Faylı yükləyək
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  } catch (error) {
    console.error('Template generation error:', error);
    throw new Error('Excel şablonu yaradılarkən xəta baş verdi');
  }
};

/**
 * Excel faylındakı məlumatları oxumaq üçün funksiya
 * @param file Excel faylı
 * @returns Məlumatlar, xəta mesajı və xəta olub-olmadığı
 */
export const parseExcelFile = (file: File): Promise<{ 
  data: any[] | null; 
  error: string | null;
  hasError: boolean;
}> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            resolve({ data: null, error: 'Fayl oxuna bilmədi', hasError: true });
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // JSON-a çevirmək
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve({ data: jsonData, error: null, hasError: false });
        } catch (error: any) {
          console.error('Excel parsing error:', error);
          resolve({ 
            data: null, 
            error: error.message || 'Excel faylı oxunarkən xəta baş verdi', 
            hasError: true 
          });
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        resolve({ 
          data: null, 
          error: 'Fayl oxunarkən xəta baş verdi', 
          hasError: true 
        });
      };
      
      reader.readAsBinaryString(file);
    } catch (error: any) {
      console.error('File processing error:', error);
      resolve({ 
        data: null, 
        error: error.message || 'Fayl emal edilərkən xəta baş verdi', 
        hasError: true 
      });
    }
  });
};

/**
 * Excel məlumatlarını validasiya etmək üçün funksiya
 * @param data Excel məlumatları
 * @param requiredColumns Tələb olunan sütunlar
 * @returns Validasiya nəticəsi
 */
export const validateExcelData = (data: any[], requiredColumns: string[]) => {
  const errors: { row: number; column: string; message: string; type: string }[] = [];
  
  // Məlumatların tələb olunan sütunları olub-olmadığını yoxlayaq
  if (data.length === 0) {
    return {
      valid: false,
      message: 'Excel faylında məlumat yoxdur',
      errors: [{ row: 0, column: 'all', message: 'Məlumat tapılmadı', type: 'error' }]
    };
  }
  
  // Tələb olunan sütunları yoxlayaq
  const firstRow = data[0];
  const missingColumns = requiredColumns.filter(col => !(col in firstRow));
  
  if (missingColumns.length > 0) {
    return {
      valid: false,
      message: `Aşağıdakı tələb olunan sütunlar excel faylında yoxdur: ${missingColumns.join(', ')}`,
      errors: missingColumns.map(col => ({ 
        row: 0, 
        column: col, 
        message: 'Tələb olunan sütun yoxdur', 
        type: 'error' 
      }))
    };
  }
  
  // Hər bir sətirdə məlumatların düzgünlüyünü yoxlayaq
  data.forEach((row, index) => {
    requiredColumns.forEach(column => {
      if (!row[column] && row[column] !== 0) {
        errors.push({
          row: index + 1, // Excel 1-dən başlayır
          column,
          message: 'Bu sahə boş ola bilməz',
          type: 'error'
        });
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    message: errors.length > 0 ? `${errors.length} xəta tapıldı` : 'Məlumatlar düzgündür',
    errors
  };
};
