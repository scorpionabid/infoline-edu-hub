import { AdvancedReportData } from '@/types/reports';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportService = {
  async exportToPDF(data: AdvancedReportData[], filename: string) {
    // PDF export implementation
    const element = document.createElement('a');
    element.href = '#';
    element.download = `${filename}.pdf`;
    element.click();
  },

  async exportToExcel(data: AdvancedReportData[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  },

  async exportToCSV(data: AdvancedReportData[], filename: string) {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }
};