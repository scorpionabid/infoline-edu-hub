
import * as XLSX from 'xlsx';
import { Sector } from '@/types/supabase';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

const exportSectorsToExcel = (sectors: Sector[], options?: ExportOptions) => {
  const { fileName = 'sectors.xlsx', sheetName = 'Sectors' } = options || {};
  
  // Format the data for export
  const data = sectors.map(sector => ({
    'Name': sector.name,
    'Description': sector.description || '',
    'Region': sector.regionName || sector.region_name || '',
    'Status': sector.status || 'active',
    'Completion Rate': `${Math.round(sector.completion_rate || 0)}%`,
    'Created At': new Date(sector.created_at).toLocaleDateString(),
    'Updated At': sector.updated_at ? new Date(sector.updated_at).toLocaleDateString() : '',
    'Admin Email': sector.admin_email || ''
  }));
  
  // Create a workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Write to file and trigger download
  XLSX.writeFile(wb, fileName);
};

export default exportSectorsToExcel;
