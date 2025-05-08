
import * as XLSX from 'xlsx';
import { School } from '@/types/school';

export const exportSchoolDataToExcel = (schools: School[], options: any = {}) => {
  const { fileName = 'schools.xlsx', sheetName = 'Schools' } = options;

  // Prepare data for export
  const data = schools.map(school => ({
    'School Name': school.name,
    'Region': school.region_name || school.regionName || '',
    'Sector': school.sector_name || school.sectorName || '',
    'Principal': school.principal_name || school.principalName || '',
    'Address': school.address || '',
    'Phone': school.phone || '',
    'Email': school.email || '',
    'Status': school.status || '',
    'Student Count': school.student_count || '',
    'Teacher Count': school.teacher_count || ''
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Export to file
  XLSX.writeFile(workbook, fileName);
  
  return true;
};

export const generateExcelTemplate = () => {
  const template = [
    {
      'School Name': '',
      'Region': '',
      'Sector': '',
      'Principal': '',
      'Address': '',
      'Phone': '',
      'Email': '',
      'Status': 'active',
      'Student Count': '',
      'Teacher Count': ''
    }
  ];
  
  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'school_import_template.xlsx');
};

export const mapRegionNameToId = (regionName: string, regions: any[]): string | null => {
  const region = regions.find(r => r.name.toLowerCase() === regionName.toLowerCase());
  return region ? region.id : null;
};

export const mapSectorNameToId = (sectorName: string, sectors: any[]): string | null => {
  const sector = sectors.find(s => s.name.toLowerCase() === sectorName.toLowerCase());
  return sector ? sector.id : null;
};

// For compatibility
export const exportSchoolsToExcel = exportSchoolDataToExcel;
