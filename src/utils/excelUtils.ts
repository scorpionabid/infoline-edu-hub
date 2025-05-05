import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Excel faylından məktəbləri idxal edir
 * 
 * @param file Excel faylı
 * @returns Məktəb obyektləri massivi
 */
export const importSchoolsFromExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
          reject(new Error('Fayl oxunmadı'));
          return;
        }
        
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData);
      } catch (error) {
        console.error('Excel import xətası:', error);
        reject(new Error('Excel faylı oxunarkən xəta baş verdi'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Fayl oxunarkən xəta baş verdi'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Məktəblər üçün Excel şablonu yaradır və yükləyir
 */
export const createSchoolExcelTemplate = () => {
  // Şablonda olacaq sütunlar
  const columns = [
    'name', 'address', 'principalName', 'phone', 'email', 'studentCount', 'teacherCount'
  ];
  
  // Şablonda olacaq başlıqlar
  const headers = {
    'name': 'Məktəbin adı',
    'address': 'Ünvan',
    'principalName': 'Direktor',
    'phone': 'Telefon',
    'email': 'E-poçt',
    'studentCount': 'Şagird sayı',
    'teacherCount': 'Müəllim sayı'
  };
  
  // Nümunə üçün boş bir sətir əlavə edirik
  const data = [
    {
      'name': 'Nümunə Məktəb',
      'address': 'Bakı şəhəri, Nəsimi rayonu',
      'principalName': 'Ad Soyad',
      'phone': '+994501234567',
      'email': 'numune@example.com',
      'studentCount': '500',
      'teacherCount': '50'
    }
  ];
  
  // Worksheet yaradırıq
  const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
  
  // Başlıqları Azərbaycanca təyin edirik
  const range = XLSX.utils.decode_range(worksheet['!ref']!);
  for (let col = range.s.c; col <= range.e.c; ++col) {
    const address = XLSX.utils.encode_col(col) + '1';
    const cell = worksheet[address];
    if (cell && cell.v) {
      // @ts-ignore
      cell.v = headers[cell.v] || cell.v;
    }
  }
  
  // Workbook yaradırıq və içinə worksheet əlavə edirik
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
  
  // Excel faylını yaradırıq və yükləyirik
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data_blob, 'mektebler_sablon.xlsx');
};

export const exportColumnsToExcel = (columns: any[]) => {
  const worksheet = XLSX.utils.json_to_sheet(columns);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sütunlar');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(data_blob, 'sutunlar_export.xlsx');
};

export const importColumnsFromExcel = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        console.error('Excel oxuma xətası:', error);
        reject(new Error('Excel faylını oxuma zamanı xəta baş verdi'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Fayl oxuma xətası'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const exportDataToExcel = async (data: any[], fileName: string = 'export.xlsx', sheetName: string = 'Sheet1') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error('Excel ixrac xətası:', error);
    throw new Error('Məlumatlar Excel formatına çevrilərkən xəta baş verdi');
  }
};

export const exportSchoolDataToExcel = async (
  data: any[],
  selectedSchools: string[] = [],
  selectedColumns: string[] = [],
  fileName: string = 'schools-export.xlsx'
) => {
  try {
    let processedData = [...data];
    
    if (selectedSchools.length > 0) {
      processedData = processedData.filter(item => selectedSchools.includes(item.schoolId));
    }
    
    if (selectedColumns.length > 0) {
      processedData = processedData.map(item => {
        const filteredColumnData = item.columnData.filter(col => selectedColumns.includes(col.columnId));
        return { ...item, columnData: filteredColumnData };
      });
    }
    
    return exportDataToExcel(processedData, fileName);
  } catch (error) {
    console.error('Məktəb datası ixrac xətası:', error);
    throw new Error('Məktəb məlumatları Excel formatına çevrilərkən xəta baş verdi');
  }
};

export const validateSchoolExcelData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Burada yoxlama məntiqi olacaq
  if (!data || data.length === 0) {
    errors.push('Excel faylı boşdur və ya məlumat yoxdur');
    return { valid: false, errors };
  }
  
  // Məcburi sütunların yoxlanılması
  const requiredColumns = ['name', 'region', 'sector'];
  const firstRow = data[0];
  
  for (const col of requiredColumns) {
    if (!firstRow.hasOwnProperty(col)) {
      errors.push(`Məcburi sütun '${col}' tapılmadı`);
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export function downloadExcelTemplate(templateName: string = 'template') {
  const templateData = [
    {
      name: 'Məktəb adı',
      principal_name: 'Direktor adı',
      region: 'Region',
      sector: 'Sektor',
      address: 'Ünvan',
      phone: 'Telefon',
      email: 'E-poçt',
      student_count: 'Şagird sayı',
      teacher_count: 'Müəllim sayı',
      type: 'Məktəb növü',
      language: 'Tədris dili'
    }
  ];
  
  exportDataToExcel(templateData, `${templateName}.xlsx`, 'Template');
}
