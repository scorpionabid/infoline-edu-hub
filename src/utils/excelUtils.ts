import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { School } from '@/types/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Excel sətri tipi
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
  'Admin adı': string;
  'Admin parolu': string;
  'Admin telefonu': string;
}

// Məktəb növünün etiketini alır
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

// Tədris dilinin etiketini alır
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

// Status etiketini alır
export const getStatusLabel = (status: string | null): string => {
  if (!status) return 'Məlum deyil';
  return status === 'active' ? 'Aktiv' : 'Deaktiv';
};

// Məktəbləri Excel faylına ixrac edir
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
      'Admin adı': '',
      'Admin parolu': '',
      'Admin telefonu': ''
    }));

    // Excel workbook və worksheet yaradılır
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // Sütun enini tənzimləyək
    const wscols = [
      { wch: 20 }, // Məktəb ID
      { wch: 30 }, // Məktəb adı
      { wch: 15 }, // Region
      { wch: 15 }, // Sektor
      { wch: 20 }, // Direktor
      { wch: 25 }, // Ünvan
      { wch: 15 }, // Telefon
      { wch: 25 }, // E-poçt
      { wch: 10 }, // Şagird sayı
      { wch: 10 }, // Müəllim sayı
      { wch: 15 }, // Məktəb növü
      { wch: 15 }, // Tədris dili
      { wch: 10 }, // Status
      { wch: 25 }, // Admin e-poçt
      { wch: 20 }, // Admin adı
      { wch: 15 }, // Admin parolu
      { wch: 15 }  // Admin telefonu
    ];
    worksheet['!cols'] = wscols;
    
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

// Excel faylından məktəb məlumatlarını idxal edir
export const importSchoolsFromExcel = async (
  file: File,
  onComplete: (schools: Partial<School>[]) => void
): Promise<void> => {
  try {
    return new Promise((resolve, reject) => {
      console.log('Excel idxalı başladı:', file.name);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            const error = 'Fayl oxunarkən xəta baş verdi';
            console.error(error);
            toast.error(error);
            reject(new Error(error));
            return;
          }
          
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          console.log('Fayl oxundu, Excel-ə çevrilir...');
          const workbook = XLSX.read(data, { type: 'array' });
          
          // İlk worksheeti alırıq
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // JSON-a çeviririk
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          if (!jsonData || jsonData.length === 0) {
            const error = 'Excel faylında məlumat tapılmadı';
            console.error(error);
            toast.error(error);
            reject(new Error(error));
            return;
          }
          
          console.log('Excel məlumatları JSON-a çevrildi:', jsonData);
          
          try {
            // Region və sektor adlarının ID-lərə çevrilməsi
            const processedSchools: Partial<School>[] = [];
            
            for (const [index, row] of jsonData.entries()) {
              console.log(`Sətir ${index + 1} işlənir:`, row);
              
              if (!row['Məktəb adı']) {
                console.warn(`Sətir ${index + 1}: Məktəb adı boşdur, keçilir`);
                continue;
              }

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
              
              // Admin məlumatlarını əlavə edək
              if (row['Admin e-poçt']) {
                console.log(`Sətir ${index + 1}: Admin məlumatları tapıldı:`, {
                  email: row['Admin e-poçt'],
                  name: row['Admin adı'],
                  phone: row['Admin telefonu']
                });

                (schoolData as any).adminData = {
                  email: row['Admin e-poçt'],
                  name: row['Admin adı'] || '',
                  password: row['Admin parolu'] || 'InfoLine2024!',
                  phone: row['Admin telefonu'] || ''
                };
              }
              
              // Region adını ID-yə çevir
              if (row['Region']) {
                console.log(`Sətir ${index + 1}: Region axtarılır:`, row['Region']);
                try {
                  const regionId = await mapRegionNameToId(row['Region']);
                  if (regionId) {
                    schoolData.region_id = regionId;
                    console.log(`Sətir ${index + 1}: Region tapıldı, ID:`, regionId);
                  } else {
                    console.warn(`Sətir ${index + 1}: Region tapılmadı:`, row['Region']);
                    toast.warning(`${row['Məktəb adı']}: "${row['Region']}" adlı region tapılmadı`);
                  }
                } catch (error) {
                  console.error(`Sətir ${index + 1}: Region axtarışı zamanı xəta:`, error);
                }
              }
              
              // Sektor adını ID-yə çevir
              if (row['Sektor']) {
                console.log(`Sətir ${index + 1}: Sektor axtarılır:`, row['Sektor']);
                try {
                  const sectorId = await mapSectorNameToId(row['Sektor'], schoolData.region_id);
                  if (sectorId) {
                    schoolData.sector_id = sectorId;
                    console.log(`Sətir ${index + 1}: Sektor tapıldı, ID:`, sectorId);
                  } else {
                    console.warn(`Sətir ${index + 1}: Sektor tapılmadı:`, row['Sektor']);
                    toast.warning(`${row['Məktəb adı']}: "${row['Sektor']}" adlı sektor tapılmadı`);
                  }
                } catch (error) {
                  console.error(`Sətir ${index + 1}: Sektor axtarışı zamanı xəta:`, error);
                }
              }
              
              // Məcburi sahələri yoxla
              if (!schoolData.name || !schoolData.region_id || !schoolData.sector_id) {
                const missingFields = [];
                if (!schoolData.name) missingFields.push('Məktəb adı');
                if (!schoolData.region_id) missingFields.push('Region');
                if (!schoolData.sector_id) missingFields.push('Sektor');
                
                console.error(`Sətir ${index + 1}: Məcburi sahələr çatışmır:`, missingFields);
                toast.error(`${schoolData.name || 'Məktəb'}: ${missingFields.join(', ')} tələb olunur`);
                continue;
              }
              
              processedSchools.push(schoolData);
              console.log(`Sətir ${index + 1}: Məlumatlar hazırlandı:`, schoolData);
            }
            
            if (processedSchools.length === 0) {
              const error = 'Heç bir məktəb məlumatı idxal edilmədi';
              console.error(error);
              toast.error(error);
              reject(new Error(error));
              return;
            }
            
            console.log('Bütün məlumatlar hazırlandı:', processedSchools);
            onComplete(processedSchools);
            resolve();
          } catch (error: any) {
            console.error('Məlumatlar işlənərkən xəta:', error);
            toast.error('Məlumatlar işlənərkən xəta baş verdi', {
              description: error.message
            });
            reject(error);
          }
        } catch (error: any) {
          console.error('Excel faylı işlənərkən xəta:', error);
          toast.error('Excel faylı işlənərkən xəta baş verdi', {
            description: error.message
          });
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Fayl oxunarkən xəta:', error);
        toast.error('Fayl oxunarkən xəta baş verdi');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error: any) {
    console.error('Excel idxalı zamanı xəta:', error);
    toast.error('Excel idxalı zamanı xəta baş verdi', {
      description: error.message
    });
    throw error;
  }
};

// Excel şablonu yaratmaq üçün boş məlumatları təyin edirik
export const generateExcelTemplate = (): void => {
  try {
    const templateData: SchoolExcelRow[] = [
      {
        'Məktəb ID': '', // İdxal zamanı istifadə olunmur
        'Məktəb adı': 'Nümunə məktəb',
        'Region': 'Nümunə region', // İdxal zamanı regionun adı istifadə olunur
        'Sektor': 'Nümunə sektor', // İdxal zamanı sektorun adı istifadə olunur
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
        'Admin adı': 'Admin Nümunə',
        'Admin parolu': 'şifrə123',
        'Admin telefonu': '+994501234567'
      },
    ];

    // Excel workbook və worksheet yaradılır
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    // Sütun enini tənzimləyək
    const wscols = [
      { wch: 20 }, // Məktəb ID
      { wch: 30 }, // Məktəb adı
      { wch: 15 }, // Region
      { wch: 15 }, // Sektor
      { wch: 20 }, // Direktor
      { wch: 25 }, // Ünvan
      { wch: 15 }, // Telefon
      { wch: 25 }, // E-poçt
      { wch: 10 }, // Şagird sayı
      { wch: 10 }, // Müəllim sayı
      { wch: 15 }, // Məktəb növü
      { wch: 15 }, // Tədris dili
      { wch: 10 }, // Status
      { wch: 25 }, // Admin e-poçt
      { wch: 20 }, // Admin adı
      { wch: 15 }, // Admin parolu
      { wch: 15 }  // Admin telefonu
    ];
    worksheet['!cols'] = wscols;
    
    // Qeydlər əlavə edək
    const instructions = [
      { A: "Qeydlər:" },
      { A: "1. Məktəb ID sütunu yalnız mövcud məktəbləri yeniləmək üçündür. Yeni məktəblər üçün boş saxlayın." },
      { A: "2. Region və Sektor sütunlarını düzgün doldurun - sistem bu adlara əsasən ID-ləri təyin edəcək." },
      { A: "3. Admin e-poçt məcburi deyil. Əgər göstərilsə, admin avtomatik yaradılacaq." },
      { A: "4. Mövcud admin e-poçtundan istifadə etsəniz, admin yenilənəcək." },
      { A: "5. Status sütununda 'Aktiv' və ya 'Deaktiv' yazın." }
    ];
    
    // Qeydləri əlavə edək (C2:C7 hüceyrələrinə)
    XLSX.utils.sheet_add_json(worksheet, instructions, { skipHeader: true, origin: { r: templateData.length + 2, c: 0 } });
    
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

// Region adını ID-yə çevirmək üçün funksiya
export const mapRegionNameToId = async (regionName: string): Promise<string | null> => {
  if (!regionName) return null;
  
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id')
      .ilike('name', `%${regionName}%`)
      .limit(1);
      
    if (error) throw error;
    
    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error('Region adını ID-yə çevirərkən xəta:', error);
    return null;
  }
};

// Sektor adını ID-yə çevirmək üçün funksiya
export const mapSectorNameToId = async (sectorName: string, regionId?: string): Promise<string | null> => {
  if (!sectorName) return null;
  
  try {
    let query = supabase
      .from('sectors')
      .select('id')
      .ilike('name', `%${sectorName}%`);
      
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query.limit(1);
    
    if (error) throw error;
    
    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error('Sektor adını ID-yə çevirərkən xəta:', error);
    return null;
  }
};
