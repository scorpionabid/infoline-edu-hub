
import { School } from '@/types/school';
import * as XLSX from 'xlsx';

/**
 * Məktəbləri Excel faylına çevirən funksiya
 * @param schools Məktəblərin siyahısı
 * @param regionNames Region adlarının ID-lərlə xəritəsi
 * @param sectorNames Sektor adlarının ID-lərlə xəritəsi
 */
export const exportSchoolsToExcel = (
  schools: School[],
  regionNames: Record<string, string> = {},
  sectorNames: Record<string, string> = {}
) => {
  try {
    // Məktəbləri Excel üçün formatlaşdırırıq
    const formattedData = schools.map(school => ({
      'Məktəb adı': school.name,
      'Region': regionNames[school.regionId || ''] || school.regionName || '',
      'Sektor': sectorNames[school.sectorId || ''] || school.sectorName || '',
      'Ünvan': school.address || '',
      'Telefon': school.phone || '',
      'E-poçt': school.email || '',
      'Növ': school.type || '',
      'Tədris dili': school.language || '',
      'Direktor': school.principal_name || '',
      'Şagird sayı': school.student_count || 0,
      'Müəllim sayı': school.teacher_count || 0,
      'Status': school.status || 'active',
      'Admin E-poçt': school.admin_email || '',
    }));

    // Excel faylı yaradırıq
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Məktəblər');
    
    // Daha oxunaqlı olması üçün sütunların enini tənzimləyirik
    const wscols = Object.keys(formattedData[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = wscols;

    // Faylı yükləyirik
    XLSX.writeFile(wb, 'məktəblər.xlsx');
  } catch (error) {
    console.error('Məktəbləri Excel-ə ixrac edərkən xəta:', error);
  }
};
