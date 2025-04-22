import { Column, ColumnType, ColumnOption, ColumnValidation } from '@/types/column';
import { Json } from '@/types/json';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const columnAdapter = {
  adaptColumnToForm: (column: Column) => {
    // Form için column nesnesini adapte et
    return {
      id: column.id,
      category_id: column.category_id,
      name: column.name,
      type: column.type,
      is_required: column.is_required ?? true, // Default olarak zorunlu
      placeholder: column.placeholder || '',
      help_text: column.help_text || '',
      order_index: column.order_index || 0,
      status: column.status || 'active',
      validation: column.validation || {},
      default_value: column.default_value || '',
      options: column.options || [],
      parent_column_id: column.parent_column_id || undefined,
      created_at: column.created_at,
      updated_at: column.updated_at
    };
  },
  
  adaptFormToColumn: (formData: Partial<Column>): Partial<Column> => {
    // Form verilerini Column tipine adapte et
    const column: Partial<Column> = {
      id: formData.id,
      category_id: formData.category_id,
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      placeholder: formData.placeholder,
      help_text: formData.help_text,
      order_index: formData.order_index || 0,
      status: formData.status || 'active',
      default_value: formData.default_value || '',
      parent_column_id: formData.parent_column_id
    };
    
    // Validation və options sahələrini əlavə et
    if (formData.validation) {
      column.validation = formData.validation as ColumnValidation;
    }
    
    if (formData.options) {
      // Options-ları düzgün formatda saxlamaq üçün əmin oluruq ki, hər bir element düzgün formatdadır
      if (Array.isArray(formData.options)) {
        column.options = formData.options.map((opt: any) => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          } else if (typeof opt === 'object' && opt !== null) {
            return {
              label: opt.label || String(opt),
              value: opt.value || opt.label || String(opt)
            };
          }
          return { label: String(opt), value: String(opt) };
        });
      } else {
        console.warn('Options array formatında deyil:', formData.options);
        column.options = [];
      }
    }
    
    return column;
  },
  
  adaptSupabaseToColumn: (dbColumn: any): Column => {
    if (!dbColumn) {
      console.error('Null or undefined dbColumn in adaptSupabaseToColumn');
      throw new Error('Cannot adapt null or undefined column data');
    }
    
    // DB'den gelen verileri model tipine dönüştür
    const column: Column = {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type as ColumnType,
      is_required: dbColumn.is_required ?? true,
      placeholder: dbColumn.placeholder || '',
      help_text: dbColumn.help_text || '',
      order_index: dbColumn.order_index || 0,
      status: dbColumn.status || 'active',
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at,
      version: dbColumn.version || 1 // Versiya məlumatını əlavə edirik
    };
    
    // Validasyon kurallarını parse et
    if (dbColumn.validation) {
      try {
        column.validation = typeof dbColumn.validation === 'string' 
          ? JSON.parse(dbColumn.validation) 
          : dbColumn.validation as ColumnValidation;
      } catch (e) {
        console.error('Validasyon kuralları parse hatası:', e);
        column.validation = {};
      }
    }
    
    // Seçenekleri parse et - tam təkmilləşdirilmiş versiya
    if (dbColumn.options) {
      try {
        let parsedOptions;
        
        // Debug üçün orijinal options-ı log edirik
        console.log(`Processing options for column ${dbColumn.id} (${dbColumn.name}):`, {
          originalOptions: dbColumn.options,
          type: typeof dbColumn.options
        });
        
        // String formatından JSON-a çevirmə
        if (typeof dbColumn.options === 'string') {
          const optionsStr = dbColumn.options.trim();
          
          // Boş string-dirsə, boş massiv qaytarırıq
          if (!optionsStr) {
            column.options = [];
            return column;
          }
          
          // 1. Xüsusi format: {"label":"X","value":"x"},{"label":"Y","value":"y"}
          if (optionsStr.includes('},{')) {
            try {
              // Əgər string [ ilə başlamırsa, onu array-ə çeviririk
              let jsonStr = optionsStr;
              if (!jsonStr.startsWith('[')) {
                jsonStr = `[${jsonStr}]`;
              }
              
              // JSON parse etməyə çalışırıq
              try {
                parsedOptions = JSON.parse(jsonStr);
                console.log(`Successfully parsed special format for column ${dbColumn.id}:`, parsedOptions);
              } catch (jsonError) {
                console.warn(`JSON parse error for column ${dbColumn.id}:`, jsonError);
                
                // Əgər JSON parse işləmirsə, manual olaraq parçalayırıq
                const items = optionsStr.split('},{').map(item => {
                  // İlk və son elementlər üçün xüsusi işləmə
                  let cleanItem = item;
                  if (item.startsWith('{') && !item.endsWith('}')) {
                    cleanItem = item + '}';
                  } else if (!item.startsWith('{') && item.endsWith('}')) {
                    cleanItem = '{' + item;
                  } else if (!item.startsWith('{') && !item.endsWith('}')) {
                    cleanItem = '{' + item + '}';
                  }
                  
                  try {
                    return JSON.parse(cleanItem);
                  } catch (e) {
                    console.warn(`Failed to parse item "${cleanItem}" for column ${dbColumn.id}:`, e);
                    return null;
                  }
                }).filter(Boolean);
                
                if (items.length > 0) {
                  console.log(`Manually parsed ${items.length} items for column ${dbColumn.id}`);
                  parsedOptions = items;
                } else {
                  // Əgər heç bir element parse edilə bilmirsə, string-i birbaşa istifadə edirik
                  parsedOptions = [{ label: optionsStr, value: optionsStr }];
                }
              }
            } catch (e) {
              console.error(`Failed to process special format for column ${dbColumn.id}:`, e);
              parsedOptions = [{ label: optionsStr, value: optionsStr }];
            }
          } else {
            // 2. Normal JSON parse
            try {
              parsedOptions = JSON.parse(optionsStr);
              console.log(`Standard JSON parse result for column ${dbColumn.id}:`, parsedOptions);
            } catch (parseError) {
              console.warn(`Options JSON kimi parse edilə bilmədi for column ${dbColumn.id}:`, parseError);
              // Əgər JSON kimi parse edilə bilmirsə, string-i birbaşa istifadə edirik
              parsedOptions = [{ label: optionsStr, value: optionsStr }];
            }
          }
        } else {
          parsedOptions = dbColumn.options;
        }
        
        // Massiv olub-olmadığını yoxlayırıq
        if (Array.isArray(parsedOptions)) {
          // Hər bir element üçün düzgün format təmin edirik
          column.options = parsedOptions.map((opt: any) => {
            // String formatında olan options
            if (typeof opt === 'string') {
              return { label: opt, value: opt };
            } 
            // Obyekt formatında olan options
            else if (typeof opt === 'object' && opt !== null) {
              // label və value sahələri varsa
              if ('label' in opt && 'value' in opt) {
                return {
                  label: String(opt.label),
                  value: String(opt.value)
                };
              }
              
              // Əgər obyektdə label və value yoxdursa, amma başqa sahələr varsa
              const keys = Object.keys(opt);
              if (keys.length > 0) {
                // İlk sahəni label və value kimi istifadə edirik
                const firstKey = keys[0];
                return {
                  label: String(opt[firstKey]),
                  value: String(firstKey)
                };
              }
            }
            
            // Digər hallar üçün
            return { label: String(opt), value: String(opt) };
          });
        } 
        // Əgər obyektdirsə və label/value cütlüyü formatındadırsa
        else if (parsedOptions && typeof parsedOptions === 'object') {
          column.options = Object.entries(parsedOptions).map(([key, value]) => ({
            label: String(value),
            value: key
          }));
        }
        // Digər hallar üçün boş massiv
        else {
          console.warn('Invalid options format, using empty array instead:', parsedOptions);
          column.options = [];
        }
        
        // Debug üçün son options-ı log edirik
        console.log(`Final options for column ${dbColumn.id} (${dbColumn.name}):`, {
          processedOptions: column.options,
          count: column.options.length
        });
        
      } catch (e) {
        console.error('Seçenekler parse hatası:', e, 'Original options:', dbColumn.options);
        column.options = [];
      }
    } else {
      column.options = [];
    }
    
    // Parent sütun ID'sini ekle
    if (dbColumn.parent_column_id) {
      column.parent_column_id = dbColumn.parent_column_id;
    }
    
    // Default değer
    if (dbColumn.default_value !== null && dbColumn.default_value !== undefined) {
      column.default_value = dbColumn.default_value;
    }
    
    return column;
  },
  
  checkForConflicts: async (columnId: string, formData: Partial<Column>): Promise<{
    hasConflict: boolean;
    conflictDetails?: {
      field: string;
      localValue: any;
      dbValue: any;
    }[];
    dbColumn?: Column;
  }> => {
    try {
      // DB-dən cari column məlumatlarını əldə edirik
      const { data: dbColumn, error } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();
      
      if (error) {
        console.error('Column məlumatlarını əldə etmə xətası:', error);
        return { hasConflict: false };
      }
      
      if (!dbColumn) {
        console.warn(`ID: ${columnId} ilə column tapılmadı`);
        return { hasConflict: false };
      }
      
      // DB-dəki column-u adaptasiya edirik
      const adaptedDbColumn = columnAdapter.adaptSupabaseToColumn(dbColumn);
      
      // Toqquşmaları aşkar edirik
      const conflicts: {
        field: string;
        localValue: any;
        dbValue: any;
      }[] = [];
      
      // Yoxlanılacaq sahələr
      const fieldsToCheck = [
        'name', 'type', 'is_required', 'placeholder', 'help_text', 
        'order_index', 'status', 'validation', 'options'
      ];
      
      for (const field of fieldsToCheck) {
        if (field in formData && JSON.stringify(formData[field]) !== JSON.stringify(adaptedDbColumn[field])) {
          // Xüsusi hallar üçün əlavə yoxlamalar
          if (field === 'options') {
            // Options massivlərini daha dəqiq müqayisə edirik
            const formOptions = formData.options || [];
            const dbOptions = adaptedDbColumn.options || [];
            
            // Əgər uzunluqlar fərqlidirsə, toqquşma var
            if (formOptions.length !== dbOptions.length) {
              conflicts.push({
                field,
                localValue: formOptions,
                dbValue: dbOptions
              });
              continue;
            }
            
            // Hər bir elementin dəyərlərini müqayisə edirik
            let optionsConflict = false;
            for (let i = 0; i < formOptions.length; i++) {
              if (formOptions[i].value !== dbOptions[i].value || 
                  formOptions[i].label !== dbOptions[i].label) {
                optionsConflict = true;
                break;
              }
            }
            
            if (optionsConflict) {
              conflicts.push({
                field,
                localValue: formOptions,
                dbValue: dbOptions
              });
            }
          } else {
            // Digər sahələr üçün standart müqayisə
            conflicts.push({
              field,
              localValue: formData[field],
              dbValue: adaptedDbColumn[field]
            });
          }
        }
      }
      
      return {
        hasConflict: conflicts.length > 0,
        conflictDetails: conflicts.length > 0 ? conflicts : undefined,
        dbColumn: adaptedDbColumn
      };
    } catch (error) {
      console.error('Toqquşma yoxlaması zamanı xəta:', error);
      return { hasConflict: false };
    }
  },
  
  resolveConflicts: (formData: Partial<Column>, dbColumn: Column, fieldsToKeep: string[]): Partial<Column> => {
    const resolvedData = { ...formData };
    
    // Seçilmiş sahələr üçün DB dəyərlərini istifadə edirik
    for (const field of fieldsToKeep) {
      if (field in dbColumn) {
        resolvedData[field] = dbColumn[field];
      }
    }
    
    return resolvedData;
  },
  
  updateColumnWithVersionCheck: async (
    columnId: string, 
    updates: Partial<Column>, 
    expectedVersion: number
  ): Promise<{
    success: boolean;
    error?: string;
    newVersion?: number;
    column?: Column;
  }> => {
    try {
      // Əvvəlcə cari versiyanı yoxlayırıq
      const { data: currentColumn, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('id', columnId)
        .single();
      
      if (fetchError) {
        return { 
          success: false, 
          error: `Column məlumatlarını əldə etmə xətası: ${fetchError.message}` 
        };
      }
      
      if (!currentColumn) {
        return { 
          success: false, 
          error: `ID: ${columnId} ilə column tapılmadı` 
        };
      }
      
      const currentVersion = currentColumn.version || 1;
      
      // Versiya yoxlaması
      if (currentVersion !== expectedVersion) {
        // Toqquşma aşkar edildi
        return {
          success: false,
          error: `Versiya toqquşması: Gözlənilən versiya ${expectedVersion}, DB-də olan versiya ${currentVersion}`,
          column: columnAdapter.adaptSupabaseToColumn(currentColumn)
        };
      }
      
      // Yeni versiya təyin edirik
      const newVersion = currentVersion + 1;
      const updatesWithVersion = {
        ...updates,
        version: newVersion,
        updated_at: new Date().toISOString()
      };
      
      // Column-u yeniləyirik
      const { data: updatedColumn, error: updateError } = await supabase
        .from('columns')
        .update(updatesWithVersion)
        .eq('id', columnId)
        .select('*')
        .single();
      
      if (updateError) {
        return { 
          success: false, 
          error: `Column yeniləmə xətası: ${updateError.message}` 
        };
      }
      
      return {
        success: true,
        newVersion,
        column: columnAdapter.adaptSupabaseToColumn(updatedColumn)
      };
    } catch (error) {
      console.error('Column yeniləmə zamanı xəta:', error);
      return { 
        success: false, 
        error: `Gözlənilməyən xəta: ${error.message}` 
      };
    }
  }
};
