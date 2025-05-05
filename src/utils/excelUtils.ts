
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { School } from '@/types/school';

/**
 * Excel faylından məktəbləri idxal edir
 * 
 * @param file Excel faylı
 * @returns Məktəb obyektləri massivi
 */
export const importSchoolsFromExcel = async (file: File): Promise<Partial<School>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk worksheet-i götürürük
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // JSON-a çeviririk
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        // Məktəb obyektlərinə çeviririk
        const schools = jsonData.map(row => {
          return {
            name: row.name || row.Name || row.SchoolName || row['Məktəbin adı'] || '',
            address: row.address || row.Address || row['Ünvan'] || '',
            principalName: row.principalName || row.PrincipalName || row['Direktor'] || '',
            phone: row.phone || row.Phone || row['Telefon'] || '',
            email: row.email || row.Email || row['E-poçt'] || '',
            studentCount: row.studentCount || row.StudentCount || row['Şagird sayı'] || 0,
            teacherCount: row.teacherCount || row.TeacherCount || row['Müəllim sayı'] || 0,
          };
        });
        
        resolve(schools);
      } catch (error) {
        console.error('Excel faylını oxuma xətası:', error);
        reject(new Error('Excel faylını oxuma xətası'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Fayl oxuma xətası'));
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
