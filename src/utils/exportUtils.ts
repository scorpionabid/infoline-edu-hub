
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Excel export helper funksiyaları
export const exportDataToExcel = (data: any[], fileName: string = 'export.xlsx') => {
  // Verilənləri excel formatına çevirmək
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Workbook yaratmaq
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Excel faylını yaratmaq və endirmək
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  // Faylı endirmək
  saveAs(fileData, fileName);
};

// Excel verilənlərini JSON obyektlərinə çevirmək
export const convertExcelToJson = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk vərəqi əldə etmək
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Vərəqi JSON-a çevirmək
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Excel şablonu yaratmaq
export const createExcelTemplate = (headers: string[], fileName: string = 'template.xlsx') => {
  // Boş qeyd yaratmaq
  const data = [
    headers.reduce((acc, header) => {
      acc[header] = '';
      return acc;
    }, {} as Record<string, string>)
  ];
  
  // Vərəq yaratmaq
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Workbook yaratmaq
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  
  // Excel faylını yaratmaq və endirmək
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  // Faylı endirmək
  saveAs(fileData, fileName);
};

export const exportToExcel = exportDataToExcel;
