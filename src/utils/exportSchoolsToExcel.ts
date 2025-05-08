
import { School } from '@/types/school';
import * as XLSX from 'xlsx';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

const exportSchoolsToExcel = (schools: School[], options: ExportOptions = {}) => {
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

export default exportSchoolsToExcel;
