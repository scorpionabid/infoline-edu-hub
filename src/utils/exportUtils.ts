
import * as XLSX from 'xlsx';

export const exportDataToExcel = (
  data: any[],
  sheetName = 'Sheet 1',
  fileName = 'export.xlsx',
  headers?: Record<string, string>
) => {
  try {
    if (!data || data.length === 0) {
      console.warn('Eksport üçün heç bir məlumat yoxdur');
      return;
    }

    // Məlumatları XLSX formatına çevir
    const worksheet = XLSX.utils.json_to_sheet(
      data.map(item => {
        // Əgər başlıq adları varsa, onlara görə çevirmək
        if (headers) {
          const formattedItem: Record<string, any> = {};
          Object.entries(item).forEach(([key, value]) => {
            if (headers[key]) {
              formattedItem[headers[key]] = value;
            } else {
              formattedItem[key] = value;
            }
          });
          return formattedItem;
        }
        return item;
      })
    );

    // Workbook yaratmaq
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Avtofiltrləmə
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    worksheet['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } })
    };

    // Faylı endirmək
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Eksport zamanı xəta:', error);
    return false;
  }
};

export const exportSchoolsToExcel = (schools: any[], fileName = 'məktəblər_ixrac.xlsx') => {
  const headers: Record<string, string> = {
    name: 'Məktəb adı',
    regionName: 'Region',
    sectorName: 'Sektor',
    address: 'Ünvan',
    principalName: 'Direktor',
    studentCount: 'Şagird sayı',
    teacherCount: 'Müəllim sayı',
    email: 'E-poçt',
    phone: 'Telefon',
    completionRate: 'Tamamlanma faizi (%)',
    status: 'Status'
  };

  return exportDataToExcel(schools, 'Məktəblər', fileName, headers);
};

export const exportReportToExcel = (data: any[], reportName: string, fileName = 'hesabat.xlsx') => {
  return exportDataToExcel(data, reportName, fileName);
};

export const createDataEntryTemplate = (
  categoryName: string,
  columns: { name: string; type: string; required: boolean }[],
  fileName = 'məlumat_daxiletmə_şablonu.xlsx'
) => {
  try {
    // Data şablonu yaratmaq
    const template: any[] = [];
    
    // Boş bir sətir əlavə edək
    const emptyRow: Record<string, any> = {};
    columns.forEach(col => {
      emptyRow[col.name] = '';
    });
    template.push(emptyRow);
    
    // Excel lövhəsi yaratmaq
    const worksheet = XLSX.utils.json_to_sheet(template);
    
    // Validasiya üçün şərhlər əlavə etmək
    const comments: Record<string, { a: string, t: string, h: string }> = {};
    
    columns.forEach((col, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      const hexColor = col.required ? '#FFCCCC' : '#FFFFFF';
      
      // Sütun başlığında məcburi sahələri qırmızı rənglə işarələmək
      worksheet[cellAddress] = { 
        ...worksheet[cellAddress],
        v: col.name,
        s: { fill: { fgColor: { rgb: hexColor.replace('#', '') } } }
      };
      
      // Şərh əlavə etmək
      let commentText = `Tip: ${col.type}\n`;
      commentText += col.required ? 'Bu sahə məcburidir' : 'Bu sahə istəyə bağlıdır';
      
      comments[cellAddress] = {
        a: 'System',
        t: commentText,
        h: commentText
      };
    });
    
    // Excel faylına şərhləri əlavə etmək
    worksheet['!comments'] = comments;
    
    // Workbook yaratmaq
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, categoryName);
    
    // Faylı endirmək
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error('Məlumat şablonu yaradarkən xəta:', error);
    return false;
  }
};

export const parseExcelTemplate = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          reject('Fayl oxuna bilmədi');
          return;
        }
        
        // Excel faylını oxumaq
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // İlk lövhəni götür
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON-a çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        console.error('Excel faylını parçalayarkən xəta:', error);
        reject('Excel faylını oxuyarkən xəta baş verdi');
      }
    };
    
    reader.onerror = (error) => {
      console.error('Fayl oxunarkən xəta:', error);
      reject('Fayl oxunarkən xəta baş verdi');
    };
    
    reader.readAsBinaryString(file);
  });
};

export { exportDataToExcel as exportToExcel };
