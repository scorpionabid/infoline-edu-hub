
import * as XLSX from 'xlsx';
import { Sector } from '@/types/supabase';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

const defaultOptions: ExportOptions = {
  fileName: 'sectors.xlsx',
  sheetName: 'Sectors'
};

const exportSectorsToExcel = (sectors: Sector[], options: ExportOptions = defaultOptions) => {
  // Merge options with defaults
  const exportOptions = { ...defaultOptions, ...options };
  
  // Prepare data for export, simplify objects to flat structure
  const data = sectors.map(sector => ({
    'ID': sector.id,
    'Name': sector.name,
    'Description': sector.description || '',
    'Region ID': sector.region_id,
    'Status': sector.status,
    'Admin Email': sector.admin_email || '',
    'Completion Rate': sector.completion_rate ? `${sector.completion_rate}%` : '0%',
    'Created': new Date(sector.created_at).toLocaleString(),
    'Updated': sector.updated_at ? new Date(sector.updated_at).toLocaleString() : ''
  }));
  
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, exportOptions.sheetName || 'Sectors');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, exportOptions.fileName || 'sectors.xlsx');
};

export default exportSectorsToExcel;
