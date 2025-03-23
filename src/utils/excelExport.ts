
import * as XLSX from 'xlsx';
import { CategoryColumn, ExportOptions, SchoolColumnData } from '../types/report';
import { formatDate } from './formatDateUtils';

export const exportToExcel = (
  data: SchoolColumnData[],
  columns: CategoryColumn[],
  options: ExportOptions = {}
) => {
  try {
    const {
      customFileName,
      includeHeaders = true,
      sheetName = 'Məlumat',
      excludeColumns = [],
      includeTimestamp = true,
      includeSchoolInfo = true,
      format = 'xlsx',
    } = options;

    // Filter columns if needed
    const filteredColumns = columns.filter(col => !excludeColumns.includes(col.id));

    // Prepare the data
    const excelData = data.map(school => {
      const row: Record<string, any> = {};
      
      // Add school information if requested
      if (includeSchoolInfo) {
        row['Məktəb adı'] = school.schoolName;
        
        // Add region and sector if available
        if (school.region) {
          row['Region'] = school.region;
        }
        
        if (school.sector) {
          row['Sektor'] = school.sector;
        }
      }
      
      // Add column data
      filteredColumns.forEach(column => {
        const columnData = school.columnData.find(cd => cd.columnId === column.id);
        let value = columnData?.value || '';
        
        // Format date values if needed
        if (column.type === 'date' && value && typeof value === 'string') {
          value = formatDate(value);
        }
        
        row[column.name] = value;
      });
      
      return row;
    });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate filename
    let filename = customFileName || 'export';
    if (includeTimestamp) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      filename = `${filename}-${timestamp}`;
    }
    
    // Write to file
    XLSX.writeFile(wb, `${filename}.${format}`);
    
    return {
      success: true,
      message: 'Export successful',
      filename: `${filename}.${format}`
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return {
      success: false,
      message: 'Export failed',
      error
    };
  }
};
