import { Column, ColumnOption } from '@/types/column';

export const useColumnAdapters = () => {
  const adaptColumnToForm = (column: Column) => {
    return {
      ...column,
      parent_column_id: column.parent_column_id || undefined
    };
  };

  const adaptFormToColumn = (formData: Partial<Column>): Partial<Column> => {
    return {
      ...formData,
      parent_column_id: formData.parent_column_id || null
    };
  };

  // Supabase-dən gələn sütunu tətbiq sütununa çevirmək - təkmilləşdirilmiş versiya
  const adaptSupabaseToColumn = (dbColumn: any): Column => {
    // Options-ları düzgün formatda işləmək üçün köməkçi funksiya
    const processOptions = (options: any): ColumnOption[] => {
      if (!options) return [];
      
      try {
        // Əgər string formatındadırsa, JSON kimi parse et
        let parsedOptions = options;
        if (typeof options === 'string') {
          try {
            parsedOptions = JSON.parse(options);
          } catch (e) {
            console.warn('Options JSON kimi parse edilə bilmədi:', e);
            // Əgər parse edilə bilmirsə, string-i birbaşa istifadə edirik
            return [{ label: options, value: options }];
          }
        }
        
        // Massiv olub-olmadığını yoxlayırıq
        if (Array.isArray(parsedOptions)) {
          return parsedOptions.map((opt: any) => {
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
          return Object.entries(parsedOptions).map(([key, value]) => ({
            label: String(value),
            value: key
          }));
        }
      } catch (error) {
        console.error('Options işlənərkən xəta:', error);
      }
      
      return [];
    };

    return {
      id: dbColumn.id,
      category_id: dbColumn.category_id,
      name: dbColumn.name,
      type: dbColumn.type,
      is_required: dbColumn.is_required,
      order_index: dbColumn.order_index || 0,
      status: dbColumn.status || 'active',
      validation: dbColumn.validation || {},
      default_value: dbColumn.default_value,
      placeholder: dbColumn.placeholder,
      help_text: dbColumn.help_text,
      options: processOptions(dbColumn.options),
      created_at: dbColumn.created_at,
      updated_at: dbColumn.updated_at,
      parent_column_id: dbColumn.parent_column_id
    };
  };

  // Tətbiq sütununu Supabase formatına çevirmək - təkmilləşdirilmiş versiya
  const adaptColumnToSupabase = (column: Partial<Column>) => {
    // Options-ları düzgün formatda göndərmək üçün
    let processedOptions = column.options;
    
    // Əgər options varsa və massiv formatındadırsa, hər bir elementin düzgün formatda olduğunu təmin edirik
    if (column.options && Array.isArray(column.options)) {
      processedOptions = column.options.map(opt => {
        // Əgər artıq düzgün formatdadırsa, olduğu kimi saxlayırıq
        if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
          return {
            label: String(opt.label),
            value: String(opt.value)
          };
        }
        // Əgər string formatındadırsa, düzgün formata çeviririk
        else if (typeof opt === 'string') {
          return { label: opt, value: opt };
        }
        // Digər hallar üçün
        return { label: String(opt), value: String(opt) };
      });
    }

    return {
      name: column.name,
      category_id: column.category_id,
      type: column.type,
      is_required: column.is_required,
      order_index: column.order_index,
      status: column.status,
      validation: column.validation,
      default_value: column.default_value,
      placeholder: column.placeholder,
      help_text: column.help_text,
      options: processedOptions,
      parent_column_id: column.parent_column_id
    };
  };

  return {
    adaptColumnToForm,
    adaptFormToColumn,
    adaptSupabaseToColumn,
    adaptColumnToSupabase
  };
};

// Modul seviyesinde export edilən adapter funksiyaları - təkmilləşdirilmiş versiya
export const adaptSupabaseToColumn = (dbColumn: any): Column => {
  // Options-ları düzgün formatda işləmək üçün köməkçi funksiya
  const processOptions = (options: any): ColumnOption[] => {
    if (!options) return [];
    
    try {
      // Əgər string formatındadırsa, JSON kimi parse et
      let parsedOptions = options;
      if (typeof options === 'string') {
        try {
          parsedOptions = JSON.parse(options);
        } catch (e) {
          console.warn('Options JSON kimi parse edilə bilmədi:', e);
          // Əgər parse edilə bilmirsə, string-i birbaşa istifadə edirik
          return [{ label: options, value: options }];
        }
      }
      
      // Massiv olub-olmadığını yoxlayırıq
      if (Array.isArray(parsedOptions)) {
        return parsedOptions.map((opt: any) => {
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
        return Object.entries(parsedOptions).map(([key, value]) => ({
          label: String(value),
          value: key
        }));
      }
    } catch (error) {
      console.error('Options işlənərkən xəta:', error);
    }
    
    return [];
  };

  return {
    id: dbColumn.id,
    category_id: dbColumn.category_id,
    name: dbColumn.name,
    type: dbColumn.type,
    is_required: dbColumn.is_required,
    order_index: dbColumn.order_index || 0,
    status: dbColumn.status || 'active',
    validation: dbColumn.validation || {},
    default_value: dbColumn.default_value,
    placeholder: dbColumn.placeholder,
    help_text: dbColumn.help_text,
    options: processOptions(dbColumn.options),
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at,
    parent_column_id: dbColumn.parent_column_id
  };
};

export const adaptColumnToSupabase = (column: Partial<Column>) => {
  // Options-ları düzgün formatda göndərmək üçün
  let processedOptions = column.options;
  
  // Əgər options varsa və massiv formatındadırsa, hər bir elementin düzgün formatda olduğunu təmin edirik
  if (column.options && Array.isArray(column.options)) {
    processedOptions = column.options.map(opt => {
      // Əgər artıq düzgün formatdadırsa, olduğu kimi saxlayırıq
      if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
        return {
          label: String(opt.label),
          value: String(opt.value)
        };
      }
      // Əgər string formatındadırsa, düzgün formata çeviririk
      else if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      // Digər hallar üçün
      return { label: String(opt), value: String(opt) };
    });
  }

  return {
    name: column.name,
    category_id: column.category_id,
    type: column.type,
    is_required: column.is_required,
    order_index: column.order_index,
    status: column.status,
    validation: column.validation,
    default_value: column.default_value,
    placeholder: column.placeholder,
    help_text: column.help_text,
    options: processedOptions,
    parent_column_id: column.parent_column_id
  };
};
