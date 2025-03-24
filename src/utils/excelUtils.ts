
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { School } from '@/types/supabase';
import { toast } from 'sonner';

export interface SchoolExcelRow {
  'Məktəb ID': string;
  'Məktəb adı': string;
  'Region': string;
  'Sektor': string;
  'Direktor': string;
  'Ünvan': string;
  'Telefon': string;
  'E-poçt': string;
  'Şagird sayı': number | string;
  'Müəllim sayı': number | string;
  'Məktəb növü': string;
  'Tədris dili': string;
  'Status': string;
  'Admin e-poçt': string;
}

export const getSchoolTypeLabel = (type: string | null): string => {
  if (!type) return 'Məlum deyil';
  
  const types: {[key: string]: string} = {
    'full_secondary': 'Tam orta',
    'general_secondary': 'Ümumi orta',
    'primary': 'İbtidai',
    'lyceum': 'Lisey',
    'gymnasium': 'Gimnaziya'
  };
  
  return types[type] || type;
};

export const getLanguageLabel = (language: string | null): string => {
  if (!language) return 'Məlum deyil';
  
  const languages: {[key: string]: string} = {
    'az': 'Azərbaycan',
    'ru': 'Rus',
    'en': 'İngilis',
    'tr': 'Türk'
  };
  
  return languages[language] || language;
};

export const getStatusLabel = (status: string | null): string => {
  if (!status) return 'Məlum deyil';
  return status === 'active' ? 'Aktiv' : 'Deaktiv';
};

export const exportSchoolsToExcel = (
  schools: School[], 
  regionNames: {[key: string]: string},
  sectorNames: {[key: string]: string}
): void => {
  if (!schools || schools.length === 0) {
    toast.error('İxrac ediləcək məlumat tapılmadı');
    return;
  }

  try {
    // Excel sətirləri yaradılır
    const excelData: SchoolExcelRow[] = schools.map(school => ({
      'Məktəb ID': school.id,
      'Məktəb adı': school.name,
      'Region': regionNames[school.region_id] || 'Məlum deyil',
      'Sektor': sectorNames[school.sector_id] || 'Məlum deyil',
      'Direktor': school.principal_name || '',
      'Ünvan': school.address || '',
      'Telefon': school.phone || '',
      'E-poçt': school.email || '',
      'Şagird sayı': school.student_count || '',
      'Müəllim sayı': school.teacher_count || '',
      'Məktəb növü': getSchoolTypeLabel(school.type),
      'Tədris dili': getLanguageLabel(school.language),
      'Status': getStatusLabel(school.status),
      'Admin e-poçt': school.admin_email || '',
    }));

    // Excel workbook və worksheet yaradılır
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // Excel-ə çevrilir və endirilir
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Faylı saxlama
    saveAs(blob, `Məktəblər_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast.success('Excel faylı uğurla ixrac edildi', {
      description: `${schools.length} məktəb məlumatı ixrac edildi.`
    });
  } catch (error) {
    console.error('Excel ixracı zamanı xəta:', error);
    toast.error('Excel ixracı zamanı xəta baş verdi', {
      description: 'Zəhmət olmasa, yenidən cəhd edin.'
    });
  }
};

export const importSchoolsFromExcel = async (
  file: File,
  onComplete: (schools: Partial<School>[]) => void
): Promise<void> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // İlk worksheeti alırıq
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // JSON-a çeviririk
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          if (!jsonData || jsonData.length === 0) {
            toast.error('Excel faylında məlumat tapılmadı');
            reject(new Error('Excel faylında məlumat tapılmadı'));
            return;
          }
          
          // Məlumatları School formatına çeviririk
          const schools: Partial<School>[] = jsonData.map(row => {
            // Excel sütun adları sistemimizdəki adlara uyğunlaşdırılır
            const schoolData: Partial<School> = {
              name: row['Məktəb adı'],
              principal_name: row['Direktor'] || null,
              address: row['Ünvan'] || null,
              phone: row['Telefon'] || null,
              email: row['E-poçt'] || null,
              student_count: row['Şagird sayı'] ? Number(row['Şagird sayı']) : null,
              teacher_count: row['Müəllim sayı'] ? Number(row['Müəllim sayı']) : null,
              status: row['Status'] === 'Aktiv' ? 'active' : 'inactive',
              admin_email: row['Admin e-poçt'] || null,
            };
            
            // Region və Sektor adları əsasında ID-lərini tapaq
            // NOT: Bu funksionalılq sonradan əlavə ediləcək, 
            // indiki versiyada istifadəçi region_id və sector_id-i manual təyin etməlidir
            
            return schoolData;
          });
          
          toast.success(`${schools.length} məktəb məlumatı uğurla oxundu`, {
            description: 'Məlumatlar işlənir...'
          });
          
          onComplete(schools);
          resolve();
        } catch (error) {
          console.error('Excel faylı işlənərkən xəta:', error);
          toast.error('Excel faylı işlənərkən xəta baş verdi', {
            description: 'Faylın formatını yoxlayın və yenidən cəhd edin.'
          });
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        toast.error('Fayl oxunarkən xəta baş verdi');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('Excel idxalı zamanı xəta:', error);
    toast.error('Excel idxalı zamanı xəta baş verdi');
    throw error;
  }
};

// Excel şablonu yaratmaq üçün boş məlumatları təyin edirik
export const generateExcelTemplate = (): void => {
  try {
    const templateData: SchoolExcelRow[] = [
      {
        'Məktəb ID': '', // Bu sütun idxal zamanı istifadə olunmur
        'Məktəb adı': 'Nümunə məktəb',
        'Region': '', // Bu sütun idxal zamanı istifadə olunmur
        'Sektor': '', // Bu sütun idxal zamanı istifadə olunmur
        'Direktor': 'Nümunə Direktor',
        'Ünvan': 'Nümunə ünvan',
        'Telefon': '+994123456789',
        'E-poçt': 'info@numune.edu.az',
        'Şagird sayı': 500,
        'Müəllim sayı': 50,
        'Məktəb növü': 'Tam orta',
        'Tədris dili': 'Azərbaycan',
        'Status': 'Aktiv',
        'Admin e-poçt': 'admin@numune.edu.az',
      },
    ];

    // Excel workbook və worksheet yaradılır
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // Excel-ə çevrilir və endirilir
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Faylı saxlama
    saveAs(blob, `Məktəb_şablonu.xlsx`);
    
    toast.success('Excel şablonu uğurla yaradıldı', {
      description: 'Şablonu dolduraraq sistem idxal edə bilərsiniz.'
    });
  } catch (error) {
    console.error('Excel şablonu yaradılarkən xəta:', error);
    toast.error('Excel şablonu yaradılarkən xəta baş verdi');
  }
};
