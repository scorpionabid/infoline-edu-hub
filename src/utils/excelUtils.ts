import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { School } from '@/types/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    const wscols = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 }
    ];
    worksheet['!cols'] = wscols;
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
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

const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return 'Bilinməyən xəta baş verdi';
};

export const importSchoolsFromExcel = async (
  file: File,
  onComplete: (schools: Partial<School>[]) => void,
  onProgress?: (progress: number, message: string) => void,
  onLog?: (message: string, type?: 'info' | 'warning' | 'error') => void
): Promise<void> => {
  try {
    const logInfo = (message: string) => {
      console.log(message);
      onLog?.(message, 'info');
    };
    
    const logWarning = (message: string) => {
      console.warn(message);
      onLog?.(message, 'warning');
    };
    
    const logError = (message: string) => {
      console.error(message);
      onLog?.(message, 'error');
    };
    
    logInfo(`Excel idxalı başladı: ${file.name}`);
    onProgress?.(5, 'Fayl oxunur...');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target || !e.target.result) {
            const error = 'Fayl oxunarkən xəta baş verdi';
            logError(error);
            toast.error(error);
            reject(new Error(error));
            return;
          }
          
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          logInfo('Fayl oxundu, Excel-ə çevrilir...');
          onProgress?.(10, 'Excel faylı işlənir...');
          
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            const error = 'Excel faylında heç bir vərəq tapılmadı';
            logError(error);
            toast.error(error);
            reject(new Error(error));
            return;
          }
          
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          if (!jsonData || jsonData.length === 0) {
            const error = 'Excel faylında məlumat tapılmadı';
            logError(error);
            toast.error(error);
            reject(new Error(error));
            return;
          }
          
          logInfo(`Excel məlumatları JSON-a çevrildi: ${jsonData.length} sətir tapıldı`);
          onProgress?.(20, `${jsonData.length} sətir işlənməyə başlayır...`);
          
          try {
            const processedSchools: Partial<School>[] = [];
            const processErrors: string[] = [];
            const totalRows = jsonData.length;
            
            for (const [index, row] of jsonData.entries()) {
              const rowNum = index + 1;
              const progressPercent = Math.floor(20 + (index / totalRows) * 60);
              onProgress?.(progressPercent, `Sətir ${rowNum}/${totalRows} işlənir...`);
              
              logInfo(`Sətir ${rowNum} işlənir: ${JSON.stringify(row)}`);
              
              if (!row['Məktəb adı']) {
                const warning = `Sətir ${rowNum}: Məktəb adı boşdur, keçilir`;
                logWarning(warning);
                processErrors.push(warning);
                continue;
              }

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
              
              if (row['Admin e-poçt']) {
                logInfo(`Sətir ${rowNum}: Admin məlumatları tapıldı: ${row['Admin e-poçt']}`);

                (schoolData as any).adminData = {
                  email: row['Admin e-poçt'],
                  name: row['Admin adı'] || '',
                  password: row['Admin parolu'] || 'InfoLine2024!',
                  phone: row['Admin telefonu'] || ''
                };
                
                try {
                  const { data: userData, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', row['Admin e-poçt'])
                    .maybeSingle();
                  
                  if (!error && userData && userData.id) {
                    schoolData.admin_id = userData.id;
                    logInfo(`Sətir ${rowNum}: Admin ID tapıldı: ${userData.id}`);
                  } else {
                    logWarning(`Sətir ${rowNum}: Admin ID tapılmadı, yalnız e-poçt saxlanılacaq`);
                  }
                } catch (err) {
                  logWarning(`Sətir ${rowNum}: Admin ID sorğusu zamanı xəta: ${formatErrorMessage(err)}`);
                }
              }
              
              if (row['Region']) {
                logInfo(`Sətir ${rowNum}: Region axtarılır: ${row['Region']}`);
                try {
                  const regionId = await mapRegionNameToId(row['Region']);
                  if (regionId) {
                    schoolData.region_id = regionId;
                    logInfo(`Sətir ${rowNum}: Region tapıldı, ID: ${regionId}`);
                  } else {
                    const warning = `Sətir ${rowNum}: "${row['Region']}" adlı region tapılmadı`;
                    logWarning(warning);
                    processErrors.push(warning);
                    toast.warning(`${row['Məktəb adı']}: "${row['Region']}" adlı region tapılmadı`);
                  }
                } catch (error) {
                  const errorMsg = `Sətir ${rowNum}: Region axtarışı zamanı xəta: ${formatErrorMessage(error)}`;
                  logError(errorMsg);
                  processErrors.push(errorMsg);
                }
              } else {
                const warning = `Sətir ${rowNum}: Region qeyd olunmayıb`;
                logWarning(warning);
                processErrors.push(warning);
              }
              
              if (row['Sektor']) {
                logInfo(`Sətir ${rowNum}: Sektor axtarılır: ${row['Sektor']}`);
                try {
                  const sectorId = await mapSectorNameToId(row['Sektor'], schoolData.region_id);
                  if (sectorId) {
                    schoolData.sector_id = sectorId;
                    logInfo(`Sətir ${rowNum}: Sektor tapıldı, ID: ${sectorId}`);
                  } else {
                    const warning = `Sətir ${rowNum}: "${row['Sektor']}" adlı sektor tapılmadı`;
                    logWarning(warning);
                    processErrors.push(warning);
                    toast.warning(`${row['Məktəb adı']}: "${row['Sektor']}" adlı sektor tapılmadı`);
                  }
                } catch (error) {
                  const errorMsg = `Sətir ${rowNum}: Sektor axtarışı zamanı xəta: ${formatErrorMessage(error)}`;
                  logError(errorMsg);
                  processErrors.push(errorMsg);
                }
              } else {
                const warning = `Sətir ${rowNum}: Sektor qeyd olunmayıb`;
                logWarning(warning);
                processErrors.push(warning);
              }
              
              if (!schoolData.name || !schoolData.region_id || !schoolData.sector_id) {
                const missingFields = [];
                if (!schoolData.name) missingFields.push('Məktəb adı');
                if (!schoolData.region_id) missingFields.push('Region');
                if (!schoolData.sector_id) missingFields.push('Sektor');
                
                const error = `Sətir ${rowNum}: Məcburi sahələr çatışmır: ${missingFields.join(', ')}`;
                logError(error);
                processErrors.push(error);
                toast.error(`${schoolData.name || 'Məktəb'}: ${missingFields.join(', ')} tələb olunur`);
                continue;
              }
              
              processedSchools.push(schoolData);
              logInfo(`Sətir ${rowNum}: Məlumatlar hazırlandı: ${JSON.stringify(schoolData)}`);
            }
            
            if (processedSchools.length === 0) {
              const errorMsg = processErrors.length > 0 
                ? `Heç bir məktəb idxal edilmədi. Xətalar:\n${processErrors.join('\n')}`
                : 'Heç bir məktəb məlumatı idxal edilmədi';
              
              logError(errorMsg);
              toast.error(errorMsg);
              reject(new Error(errorMsg));
              return;
            }
            
            logInfo(`Bütün məlumatlar hazırlandı: ${processedSchools.length} məktəb`);
            if (processErrors.length > 0) {
              logWarning(`${processErrors.length} xəta baş verdi:
${processErrors.join('\n')}`);
            }
            
            onProgress?.(90, 'Məlumatlar işləndi, tamamlanır...');
            onComplete(processedSchools);
            onProgress?.(100, 'Tamamlandı!');
            resolve();
          } catch (error: any) {
            const errorMsg = `Məlumatlar işlənərkən xəta: ${formatErrorMessage(error)}`;
            logError(errorMsg);
            toast.error('Məlumatlar işlənərkən xəta baş verdi', {
              description: formatErrorMessage(error)
            });
            reject(error);
          }
        } catch (error: any) {
          const errorMsg = `Excel faylı işlənərkən xəta: ${formatErrorMessage(error)}`;
          console.error(errorMsg);
          toast.error('Excel faylı işlənərkən xəta baş verdi', {
            description: formatErrorMessage(error)
          });
          onLog?.(errorMsg, 'error');
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        const errorMsg = `Fayl oxunarkən xəta: ${formatErrorMessage(error)}`;
        console.error(errorMsg);
        toast.error('Fayl oxunarkən xəta baş verdi');
        onLog?.(errorMsg, 'error');
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  } catch (error: any) {
    const errorMsg = `Excel idxalı zamanı xəta: ${formatErrorMessage(error)}`;
    console.error(errorMsg);
    toast.error('Excel idxalı zamanı xəta baş verdi', {
      description: formatErrorMessage(error)
    });
    onLog?.(errorMsg, 'error');
    throw error;
  }
};

export const generateExcelTemplate = (): void => {
  try {
    const templateData: SchoolExcelRow[] = [
      {
        'Məktəb ID': '',
        'Məktəb adı': 'Nümunə məktəb',
        'Region': 'Nümunə region',
        'Sektor': 'Nümunə sektor',
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

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
    
    const wscols = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 }
    ];
    worksheet['!cols'] = wscols;
    
    const instructions = [
      { A: "Qeydlər:" },
      { A: "1. Məktəb ID sütunu yalnız mövcud məktəbləri yeniləmək üçündür. Yeni məktəblər üçün boş saxlayın." },
      { A: "2. Region və Sektor sütunlarını düzgün doldurun - sistem bu adlara əsasən ID-ləri təyin edəcək." },
      { A: "3. Admin e-poçt məcburi deyil. Əgər göstərilsə, admin avtomatik yaradılacaq." },
      { A: "4. Mövcud admin e-poçtundan istifadə etsəniz, admin yenilənəcək." },
      { A: "5. Status sütununda 'Aktiv' və ya 'Deaktiv' yazın." }
    ];
    
    XLSX.utils.sheet_add_json(worksheet, instructions, { skipHeader: true, origin: { r: templateData.length + 2, c: 0 } });
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    saveAs(blob, `Məktəb_şablonu.xlsx`);
    
    toast.success('Excel şablonu uğurla yaradıldı', {
      description: 'Şablonu dolduraraq sistem idxal edə bilərsiniz.'
    });
  } catch (error) {
    console.error('Excel şablonu yaradılarkən xəta:', error);
    toast.error('Excel şablonu yaradılarkən xəta baş verdi');
  }
};

export const mapRegionNameToId = async (regionName: string): Promise<string | null> => {
  if (!regionName) return null;
  
  try {
    console.log(`Region adına görə axtarılır: "${regionName}"`);
    
    const { data, error } = await supabase
      .from('regions')
      .select('id, name')
      .or(`name.eq.${regionName},name.ilike.%${regionName}%`)
      .limit(10);
      
    if (error) {
      console.error('Region axtarışı zamanı Supabase xətası:', error);
      throw error;
    }
    
    console.log(`Region axtarışı nəticəsi:`, data);
    
    const exactMatch = data?.find(r => r.name.toLowerCase() === regionName.toLowerCase());
    return exactMatch?.id || (data && data.length > 0 ? data[0].id : null);
  } catch (error) {
    console.error('Region adını ID-yə çevirərkən xəta:', error);
    return null;
  }
};

export const mapSectorNameToId = async (sectorName: string, regionId?: string): Promise<string | null> => {
  if (!sectorName) return null;
  
  try {
    console.log(`Sektor adına görə axtarılır: "${sectorName}"${regionId ? `, region ID: ${regionId}` : ''}`);
    
    let query = supabase
      .from('sectors')
      .select('id, name, region_id')
      .or(`name.eq.${sectorName},name.ilike.%${sectorName}%`);
      
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    let { data, error } = await query.limit(10);
    
    if (error) {
      console.error('Sektor axtarışı zamanı Supabase xətası:', error);
      throw error;
    }
    
    if ((!data || data.length === 0) && regionId) {
      console.log('RegionId ilə sektor tapılmadı, region olmadan axtarılır');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sectors')
        .select('id, name, region_id')
        .or(`name.eq.${sectorName},name.ilike.%${sectorName}%`)
        .limit(5);
        
      if (!fallbackError && fallbackData && fallbackData.length > 0) {
        data = fallbackData;
      }
    }
    
    console.log(`Sektor axtarışı nəticəsi:`, data);
    
    const exactMatch = data?.find(s => s.name.toLowerCase() === sectorName.toLowerCase());
    return exactMatch?.id || (data && data.length > 0 ? data[0].id : null);
  } catch (error) {
    console.error('Sektor adını ID-yə çevirərkən xəta:', error);
    return null;
  }
};

export const findSchoolByNameOrCode = async (schoolName: string, regionId?: string, sectorId?: string): Promise<{ exists: boolean, school?: any }> => {
  if (!schoolName) return { exists: false };
  
  try {
    console.log(`Məktəb adına görə axtarılır: "${schoolName}"`);
    
    let { data, error } = await supabase
      .from('schools')
      .select('id, name, region_id, sector_id')
      .eq('name', schoolName)
      .limit(1);
    
    if (error) {
      console.error('Məktəb axtarışı zamanı Supabase xətası:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      const { data: similarData, error: similarError } = await supabase
        .from('schools')
        .select('id, name, region_id, sector_id')
        .ilike('name', `%${schoolName}%`)
        .limit(5);
      
      if (similarError) {
        console.error('Bənzər məktəb axtarışı zamanı Supabase xətası:', similarError);
        throw similarError;
      }
      
      data = similarData;
    }
    
    console.log(`Məktəb axtarışı nəticəsi:`, data);
    
    const exactMatch = data?.find(s => s.name.toLowerCase() === schoolName.toLowerCase());
    
    if (exactMatch) {
      if (regionId && sectorId) {
        if (exactMatch.region_id === regionId && exactMatch.sector_id === sectorId) {
          return { exists: true, school: exactMatch };
        }
        return { exists: true, school: exactMatch };
      }
      return { exists: true, school: exactMatch };
    }
    
    return { exists: false };
  } catch (error) {
    console.error('Məktəb adını yoxlayarkən xəta:', error);
    return { exists: false };
  }
};
