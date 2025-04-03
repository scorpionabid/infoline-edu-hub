
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { DataEntry } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { Category } from '@/types/category';

export const exportToExcel = (data: any[], fileName: string = 'data-export') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob and save
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// DataEntries üçün xüsusi export funksiyası
export const exportDataToExcel = (entries: DataEntry[]) => {
  // Verilənləri Excel üçün uyğun formatda hazırlayaq
  const formattedData = entries.map(entry => ({
    Category: entry.category_id, // Burada kateqoriya adını almaq üçün əlavə məntiqdən istifadə edə bilərsiniz
    Column: entry.column_id, // Sütun adı ilə dəyişdirilə bilər
    School: entry.school_id, // Məktəb adı ilə dəyişdirilə bilər
    Value: entry.value || '',
    Status: entry.status || 'pending',
    CreatedAt: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : '',
    UpdatedAt: entry.updated_at ? new Date(entry.updated_at).toLocaleDateString() : '',
  }));
  
  exportToExcel(formattedData, 'data-entries');
};

// Sütunları Excel formatında ixrac etmək üçün funksiya
export const exportColumnsToExcel = (columns: Column[], categories: Category[] = []) => {
  // Hazırladığımız məlumatları saxlayacağımız massivin təyin edilməsi
  const formattedData = columns.map(column => {
    // Kateqoriya adını tapmaq
    const category = categories.find(cat => cat.id === column.categoryId);
    
    return {
      CategoryId: column.categoryId,
      CategoryName: category ? category.name : 'Unknown Category',
      ColumnId: column.id,
      ColumnName: column.name,
      Type: column.type,
      Required: column.isRequired ? 'Yes' : 'No',
      DefaultValue: column.defaultValue || '',
      Placeholder: column.placeholder || '',
      HelpText: column.helpText || '',
      Status: column.status || 'active',
      OrderIndex: column.orderIndex || 0,
      Options: column.options ? (Array.isArray(column.options) ? column.options.join(', ') : JSON.stringify(column.options)) : ''
    };
  });
  
  exportToExcel(formattedData, 'columns-export');
};

// Məktəblərin sütun məlumatlarını Excel formatında ixrac etmək üçün funksiya 
export const exportSchoolColumnsToExcel = (data: any[]) => {
  exportToExcel(data, 'school-columns-report');
};

// Kateqoriyaları Excel formatında ixrac etmək üçün funksiya
export const exportCategoriesToExcel = (categories: Category[]) => {
  const formattedData = categories.map(category => ({
    Id: category.id,
    Name: category.name,
    Description: category.description || '',
    Assignment: category.assignment || 'all',
    Status: category.status || 'active',
    Priority: category.priority || 0,
    Deadline: category.deadline ? new Date(String(category.deadline)).toLocaleDateString() : '',
    CreatedAt: category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '',
    UpdatedAt: category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : '',
    ColumnCount: category.columnCount || 0
  }));
  
  exportToExcel(formattedData, 'categories-export');
};
