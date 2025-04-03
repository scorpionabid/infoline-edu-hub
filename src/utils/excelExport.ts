
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Category } from '@/types/category';
import { Column } from '@/types/column';

/**
 * Export categories to Excel file
 */
export const exportCategoriesToExcel = (categories: Category[]) => {
  // Prepare the data for export
  const data = categories.map(category => ({
    ID: category.id,
    Name: category.name,
    Description: category.description || "",
    Assignment: category.assignment,
    Status: category.status,
    Priority: category.priority,
    Deadline: category.deadline || "",
    Created: category.createdAt || "",
    Updated: category.updatedAt || ""
  }));

  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Save the file
  saveAs(blob, `categories_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export columns to Excel file
 */
export const exportColumnsToExcel = (columns: Column[], categoryName: string = 'Category') => {
  // Group columns by category
  const columnsByCategory: Record<string, Column[]> = {};
  
  columns.forEach(column => {
    const catId = column.categoryId;
    if (!columnsByCategory[catId]) {
      columnsByCategory[catId] = [];
    }
    columnsByCategory[catId].push(column);
  });
  
  // Prepare the data for export
  const data = columns.map(column => ({
    ID: column.id,
    Name: column.name,
    Type: column.type,
    Required: column.isRequired ? 'Yes' : 'No',
    DefaultValue: column.defaultValue || "",
    Placeholder: column.placeholder || "",
    HelpText: column.helpText || "",
    Status: column.status,
    Order: column.orderIndex || 0
  }));

  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, categoryName);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Save the file
  saveAs(blob, `columns_${categoryName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export report data to Excel file
 */
export const exportReportToExcel = (data: any[], reportName: string = 'Report') => {
  // Create a workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, reportName);

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a Blob
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Save the file
  saveAs(blob, `${reportName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
