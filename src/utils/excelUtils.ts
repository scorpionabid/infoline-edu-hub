
import { Column } from '@/types/column';
import * as XLSX from 'xlsx';
import { formatValueForDisplay } from './columnValidation';

export const generateExcelTemplate = (columns: Column[]): Blob => {
  const headers = columns.map(col => ({
    key: col.id,
    header: col.name,
    width: 20
  }));

  const worksheet = XLSX.utils.aoa_to_sheet([headers.map(h => h.header)]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Məlumatlar');

  // Set column widths
  const wscols = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const parseExcelData = (file: File, columns: Column[]): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove header row
        const rows = jsonData.slice(1);
        const columnMap = new Map(columns.map(col => [col.name, col]));

        // Map Excel data to our format
        const formattedData = rows.map((row: any[]) => {
          const rowData: Record<string, any> = {};
          columns.forEach((col, index) => {
            const value = row[index];
            rowData[col.id] = value ?? null;
          });
          return rowData;
        });

        resolve(formattedData);
      } catch (error) {
        reject(new Error('Excel faylını oxuyarkən xəta baş verdi'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Fayl oxunarkən xəta baş verdi'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: any[], columns: Column[], filename: string): void => {
  // Prepare data for export
  const headers = columns.map(col => col.name);
  const rows = data.map(item => 
    columns.map(col => formatValueForDisplay(item[col.id], col.type))
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Məlumatlar');

  // Set column widths
  const wscols = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = wscols;

  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
