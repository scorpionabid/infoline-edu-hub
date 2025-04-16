
import { School } from '@/types/supabase';
import * as XLSX from 'xlsx';

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

/**
 * Məktəbləri Excel formatına ixrac etmək üçün funksiya
 * @param schools Məktəblərin siyahısı
 * @param options Excel fayl parametrləri
 */
export const exportSchoolsToExcel = (
  schools: School[],
  options: ExcelExportOptions = {}
) => {
  if (!schools || schools.length === 0) {
    console.error('Məktəblər siyahısı boşdur');
    return;
  }

  try {
    // Default parametrləri təyin et
    const fileName = options.fileName || 'schools_export.xlsx';
    const sheetName = options.sheetName || 'Məktəblər';
    const includeHeaders = options.includeHeaders !== false;

    // Excel üçün data hazırla
    const data = schools.map(school => ({
      'Məktəb adı': school.name,
      'Region': school.region_name || '',
      'Sektor': school.sector_name || '',
      'Ünvan': school.address || '',
      'Telefon': school.phone || '',
      'Email': school.email || '',
      'Direktor': school.principal_name || '',
      'Şagird sayı': school.student_count || 0,
      'Müəllim sayı': school.teacher_count || 0,
      'Status': school.status || 'active',
      'Yaradılıb': formatDate(school.created_at || '', options.dateFormat),
      'Yenilənib': formatDate(school.updated_at || '', options.dateFormat)
    }));

    // WorkSheet yaradaq
    const worksheet = XLSX.utils.json_to_sheet(data);

    // WorkBook yaradaq və worksheeti əlavə edək
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Excel faylını yaradaq və yükləyək
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Excel ixracı zamanı xəta:', error);
  }
};

/**
 * Tarixi formatla
 */
const formatDate = (dateString: string, format?: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    if (format === 'short') {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    }
    
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export default exportSchoolsToExcel;
