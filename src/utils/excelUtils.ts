
import * as XLSX from 'xlsx';
import { School } from '@/types/school';
import { toast } from 'sonner';

// Excel-dən məktəb məlumatlarını idxal etmək üçün funksiya
export const importSchoolsFromExcel = async (file: File): Promise<Partial<School>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk işçi vərəqi götürür
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // XLSX-dən JSON-a çevirmə
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Məlumatların format doğrulanması
        const schools = jsonData.map((row: any) => {
          // Column adlarını normalize et - adlar kiçik hərflərlə, boşluqları alt xətt ilə əvəz et
          const normalizedRow: any = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
            normalizedRow[normalizedKey] = row[key];
          });
          
          // School tipi üçün uyğun sahələri qaytar
          return {
            name: normalizedRow.name || normalizedRow.school_name || '',
            regionId: normalizedRow.region_id || '',
            sectorId: normalizedRow.sector_id || '',
            address: normalizedRow.address || '',
            principalName: normalizedRow.principal_name || '',
            phone: normalizedRow.phone || '',
            email: normalizedRow.email || '',
            studentCount: normalizedRow.student_count || 0,
            teacherCount: normalizedRow.teacher_count || 0,
            type: normalizedRow.type || 'full_secondary',
            language: normalizedRow.language || 'az',
            status: normalizedRow.status || 'active'
          };
        });
        
        resolve(schools);
      } catch (error) {
        console.error('Excel idxalı xətası:', error);
        reject(new Error('Excel faylını emal edərkən xəta baş verdi'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Excel faylını oxumaq mümkün olmadı'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Məktəb məlumatlarını Excel fayl kimi ixrac etmək üçün funksiya
export const exportSchoolsToExcel = (schools: School[]): void => {
  try {
    // Obyektləri Excel üçün hazırlayır
    const worksheetData = schools.map(school => ({
      'Məktəbin adı': school.name,
      'Ünvan': school.address || '',
      'Direktor': school.principalName || '',
      'Telefon': school.phone || '',
      'Email': school.email || '',
      'Şagird sayı': school.studentCount || '',
      'Müəllim sayı': school.teacherCount || '',
      'Növ': school.type || '',
      'Tədris dili': school.language || '',
      'Status': school.status || ''
    }));
    
    // Worksheet yaradılır
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Workbook yaradılır və worksheet əlavə edilir
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // XLSX faylı hazırlanır və endirmə linki yaradılır
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Fayl endirmə linki yaradılır və tıklanır
    const fileName = `schools_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Məktəb məlumatları Excel formatında ixrac edildi');
  } catch (error) {
    console.error('Excel ixracı xətası:', error);
    toast.error('Excel ixracı zamanı xəta baş verdi');
  }
};

// Şablon Excel faylı yaratmaq üçün funksiya
export const createSchoolExcelTemplate = (): void => {
  try {
    // Şablon üçün başlıq sətri
    const headers = [
      'Məktəbin adı', 'Ünvan', 'Direktor', 'Telefon', 'Email', 
      'Şagird sayı', 'Müəllim sayı', 'Növ', 'Tədris dili', 'Status'
    ];
    
    // Nümunə data (bir sətr)
    const sampleData = [
      'Məktəb №1', 'Bakı şəhəri, Nəsimi rayonu', 'Əhmədov Əhməd', '+994123456789', 'mekteb1@example.com',
      1000, 80, 'full_secondary', 'az', 'active'
    ];
    
    // Worksheet yaradılır
    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    
    // Workbook yaradılır və worksheet əlavə edilir
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // XLSX faylı hazırlanır və endirmə linki yaradılır
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Fayl endirmə linki yaradılır və tıklanır
    const fileName = `schools_template.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Məktəb şablon faylı yaradıldı');
  } catch (error) {
    console.error('Şablon yaradılması xətası:', error);
    toast.error('Şablon yaradılması zamanı xəta baş verdi');
  }
};
