import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExcelColumn {
  key: string;
  name: string;
  type: string;
}

interface ExcelRow {
  [key: string]: any;
}

class ExcelService {
  validateExcelData(data: ExcelRow[], columns: ExcelColumn[]): boolean {
    if (!data || data.length === 0) {
      toast.error('Excel faylında məlumat yoxdur');
      return false;
    }

    const requiredColumns = columns.filter(col => col.type === 'required');
    const firstRow = data[0];
    
    for (const column of requiredColumns) {
      if (!(column.key in firstRow)) {
        toast.error(`Tələb olunan sütun tapılmadı: ${column.name}`);
        return false;
      }
    }

    return true;
  }

  formatCellValue(value: any, columnType: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (columnType) {
      case 'number':
        return Number(value) || 0;
      case 'date':
        return this.parseExcelDate(value);
      case 'text':
      case 'textarea':
      case 'email':
      case 'phone':
      case 'url':
        return String(value).trim();
      case 'select':
      case 'multiselect':
        return value;
      default:
        return value;
    }
  }

  parseExcelDate(excelSerialDate: number): Date | null {
    if (typeof excelSerialDate !== 'number') {
      return null;
    }

    const utc_days = Math.floor(excelSerialDate - 25569);
    const utc_value = utc_days * 86400;
    const date = new Date(utc_value * 1000);
    return date;
  }

  async exportArrayToExcel(data: any[], fileName: string): Promise<void> {
    if (!data || data.length === 0) {
      toast.error('Məlumat tapılmadı');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    try {
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast.success('Excel faylı uğurla yükləndi');
    } catch (error) {
      toast.error('Excel faylı yüklənərkən xəta baş verdi');
      console.error('Excel faylı yüklənərkən xəta:', error);
    }
  }
}

export const excelService = new ExcelService();
