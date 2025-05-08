
import * as XLSX from 'xlsx';
import { Sector } from '@/types/supabase';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

const exportSectorsToExcel = (
  sectors: Sector[],
  options: ExportOptions = {}
) => {
  const fileName = options.fileName || 'sectors.xlsx';
  const sheetName = options.sheetName || 'Sectors';

  // Prepare the data for Excel
  const data = sectors.map((sector) => ({
    Name: sector.name,
    Region: sector.regionName || sector.region_name || '',
    Description: sector.description || '',
    Status: sector.status || 'active',
    'Created At': new Date(sector.created_at).toLocaleString(),
    'Updated At': sector.updated_at ? new Date(sector.updated_at).toLocaleString() : '',
    'Completion Rate': sector.completion_rate ? `${sector.completion_rate}%` : '0%',
  }));

  // Create a workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate and download the Excel file
  XLSX.writeFile(wb, fileName);

  return true;
};

export default exportSectorsToExcel;
