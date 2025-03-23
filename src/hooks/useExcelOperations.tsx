
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { CategoryWithColumns } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export const useExcelOperations = (
  categories: CategoryWithColumns[], 
  updateFormDataFromExcel: (data: Record<string, any>, categoryId?: string) => void
) => {
  const { t } = useLanguage();
  
  // Excel şablonunu yükləmək
  const downloadExcelTemplate = (categoryId?: string) => {
    try {
      let selectedCategory;
      
      if (categoryId) {
        selectedCategory = categories.find(cat => cat.id === categoryId);
        if (!selectedCategory) {
          toast.error(t('categoryNotFound'));
          return;
        }
      }
      
      // Bütün kateqoriyalar üçün Excel şablonu
      const workbook = XLSX.utils.book_new();
      
      const categoriesToProcess = categoryId ? [selectedCategory!] : categories;
      
      categoriesToProcess.forEach(category => {
        const columns = category.columns.filter(col => col.status === 'active');
        
        const headerRow: Record<string, string> = {};
        const validationRow: Record<string, string> = {};
        
        columns.forEach(column => {
          // Başlıq sətri
          headerRow[column.id] = column.name + (column.isRequired ? ' *' : '');
          
          // Validasiya sətri
          let validationText = '';
          
          if (column.validationRules) {
            const rules = column.validationRules;
            
            if (column.type === 'number') {
              if (rules.minValue !== undefined && rules.maxValue !== undefined) {
                validationText = t('numberBetween').replace('{min}', rules.minValue.toString()).replace('{max}', rules.maxValue.toString());
              } else if (rules.minValue !== undefined) {
                validationText = t('minValue').replace('{min}', rules.minValue.toString());
              } else if (rules.maxValue !== undefined) {
                validationText = t('maxValue').replace('{max}', rules.maxValue.toString());
              }
            }
            
            if (column.type === 'text' && (rules.minLength || rules.maxLength)) {
              if (rules.minLength && rules.maxLength) {
                validationText = t('lengthBetween').replace('{min}', rules.minLength.toString()).replace('{max}', rules.maxLength.toString());
              } else if (rules.minLength) {
                validationText = t('minLength').replace('{min}', rules.minLength.toString());
              } else if (rules.maxLength) {
                validationText = t('maxLength').replace('{max}', rules.maxLength.toString());
              }
            }
            
            if (rules.pattern) {
              validationText += (validationText ? ', ' : '') + (rules.patternError || t('formatRequired'));
            }
          }
          
          if (column.type === 'select' || column.type === 'radio' || column.type === 'checkbox') {
            validationText += (validationText ? ', ' : '') + t('chooseFromOptions');
            
            if (column.options) {
              const optionStrings = Array.isArray(column.options) 
                ? column.options.map(opt => typeof opt === 'string' ? opt : opt.label).join(', ')
                : '';
              validationText += `: ${optionStrings}`;
            }
          }
          
          if (column.type === 'date') {
            validationText = t('dateFormat');
          }
          
          validationRow[column.id] = validationText;
        });
        
        const data = [headerRow, validationRow];
        
        // Create sheet
        const worksheet = XLSX.utils.json_to_sheet(data, {
          skipHeader: true
        });
        
        // Add to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
      });
      
      // Download
      XLSX.writeFile(workbook, `InfoLine_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success(t('templateDownloaded'));
    } catch (error) {
      console.error('Excel şablonu yaradılarkən xəta:', error);
      toast.error(t('excelTemplateError'));
    }
  };
  
  // Excel məlumatlarını yükləmək
  const uploadExcelData = async (file: File, categoryId?: string): Promise<void> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            if (!event.target || !event.target.result) {
              toast.error(t('fileReadError'));
              reject(new Error('File read error'));
              return;
            }
            
            const data = new Uint8Array(event.target.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            if (workbook.SheetNames.length === 0) {
              toast.error(t('noSheetsFound'));
              reject(new Error('No sheets found'));
              return;
            }
            
            const excelData: Record<string, any> = {};
            
            if (categoryId) {
              // Konkret kateqoriya üçün
              const category = categories.find(cat => cat.id === categoryId);
              if (!category) {
                toast.error(t('categoryNotFound'));
                reject(new Error('Category not found'));
                return;
              }
              
              const sheetName = workbook.SheetNames.find(name => name === category.name);
              if (!sheetName) {
                toast.error(t('categorySheetNotFound').replace('{name}', category.name));
                reject(new Error(`Sheet for category ${category.name} not found`));
                return;
              }
              
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);
              
              if (jsonData.length < 2) {
                toast.error(t('invalidExcelFormat'));
                reject(new Error('Invalid Excel format'));
                return;
              }
              
              const headerRow = jsonData[0] as Record<string, string>;
              const dataRow = jsonData[1] as Record<string, any>;
              
              Object.keys(headerRow).forEach(key => {
                if (dataRow[key] !== undefined) {
                  // Burada Excel hücrəsindəki məlumatı düzgün formata çevirmək
                  let value = dataRow[key];
                  
                  // Sütunu tapaq
                  const column = category.columns.find(col => col.id === key);
                  if (column) {
                    if (column.type === 'number') {
                      value = Number(value);
                    } else if (column.type === 'date') {
                      // Excel tarixləri
                      if (typeof value === 'number') {
                        // Excel tarix formatı (serialləşdirilmiş)
                        const excelEpoch = new Date(1899, 11, 30);
                        const date = new Date(excelEpoch.getTime() + (value * 24 * 60 * 60 * 1000));
                        value = date.toISOString();
                      } else if (typeof value === 'string') {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          value = date.toISOString();
                        }
                      }
                    } else if (column.type === 'checkbox') {
                      value = Boolean(value);
                    }
                  }
                  
                  excelData[key] = value;
                }
              });
            } else {
              // Bütün kateqoriyalar üçün
              categories.forEach(category => {
                const sheetName = workbook.SheetNames.find(name => name === category.name);
                if (sheetName) {
                  const worksheet = workbook.Sheets[sheetName];
                  const jsonData = XLSX.utils.sheet_to_json(worksheet);
                  
                  if (jsonData.length >= 2) {
                    const headerRow = jsonData[0] as Record<string, string>;
                    const dataRow = jsonData[1] as Record<string, any>;
                    
                    Object.keys(headerRow).forEach(key => {
                      if (dataRow[key] !== undefined) {
                        // Burada Excel hücrəsindəki məlumatı düzgün formata çevirmək
                        let value = dataRow[key];
                        
                        // Sütunu tapaq
                        const column = category.columns.find(col => col.id === key);
                        if (column) {
                          if (column.type === 'number') {
                            value = Number(value);
                          } else if (column.type === 'date') {
                            // Excel tarixləri
                            if (typeof value === 'number') {
                              // Excel tarix formatı (serialləşdirilmiş)
                              const excelEpoch = new Date(1899, 11, 30);
                              const date = new Date(excelEpoch.getTime() + (value * 24 * 60 * 60 * 1000));
                              value = date.toISOString();
                            } else if (typeof value === 'string') {
                              const date = new Date(value);
                              if (!isNaN(date.getTime())) {
                                value = date.toISOString();
                              }
                            }
                          } else if (column.type === 'checkbox') {
                            value = Boolean(value);
                          }
                        }
                        
                        excelData[key] = value;
                      }
                    });
                  }
                }
              });
            }
            
            // Form datasını yeniləyək
            updateFormDataFromExcel(excelData, categoryId);
            
            toast.success(t('excelUploaded'));
            resolve();
          } catch (error) {
            console.error('Excel məlumatı oxunarkən xəta:', error);
            toast.error(t('excelParsingError'));
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Excel faylı oxunarkən xəta:', error);
          toast.error(t('fileReadError'));
          reject(error);
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Excel yüklənərkən xəta:', error);
      toast.error(t('excelUploadError'));
      throw error;
    }
  };
  
  return {
    downloadExcelTemplate,
    uploadExcelData
  };
};
