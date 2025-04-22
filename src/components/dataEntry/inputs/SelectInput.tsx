import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column, ColumnOption } from '@/types/column';

interface SelectInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ column, form, disabled = false }) => {
  // Sütun seçənəklərini dönüşdür - tam təkmilləşdirilmiş versiya
  const options = React.useMemo(() => {
    // Debug üçün orijinal options-ı log edirik
    console.log(`Processing options for column ${column.id} (${column.name}):`, column.options);
    
    // Əgər options yoxdursa, boş massiv qaytarırıq
    if (!column.options) {
      console.log(`No options for column ${column.id}`);
      return [];
    }
    
    // Əgər options artıq array formatındadırsa və içində obyektlər varsa
    if (Array.isArray(column.options) && column.options.length > 0) {
      console.log(`Column ${column.id} has array options:`, column.options);
      
      // Array içindəki hər bir elementi ColumnOption formatına çeviririk
      return column.options.map((opt: any) => {
        if (typeof opt === 'string') {
          return { label: opt, value: opt };
        } else if (opt && typeof opt === 'object') {
          if ('label' in opt && 'value' in opt) {
            return { label: String(opt.label), value: String(opt.value) };
          }
        }
        return { label: String(opt), value: String(opt) };
      });
    }
    
    // Əgər options string formatındadırsa
    if (typeof column.options === 'string') {
      const optionsStr = column.options.trim();
      console.log(`Column ${column.id} has string options:`, optionsStr);
      
      // Boş string-dirsə, boş massiv qaytarırıq
      if (!optionsStr) {
        return [];
      }
      
      // 1. Xüsusi format: {"label":"X","value":"x"},{"label":"Y","value":"y"}
      // Bu format Supabase-də jsonb sahəsində tez-tez rast gəlinir
      if (optionsStr.includes('},{')) {
        try {
          // Əgər string [ ilə başlamırsa, onu array-ə çeviririk
          let jsonStr = optionsStr;
          if (!jsonStr.startsWith('[')) {
            jsonStr = `[${jsonStr}]`;
          }
          
          // JSON parse etməyə çalışırıq
          try {
            const parsedArray = JSON.parse(jsonStr);
            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              console.log(`Successfully parsed special format for column ${column.id}:`, parsedArray);
              return parsedArray.map(item => ({
                label: String(item.label || ''),
                value: String(item.value || '')
              }));
            }
          } catch (jsonError) {
            console.warn(`JSON parse error for column ${column.id}:`, jsonError);
            
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
                console.warn(`Failed to parse item "${cleanItem}" for column ${column.id}:`, e);
                return null;
              }
            }).filter(Boolean);
            
            if (items.length > 0) {
              console.log(`Manually parsed ${items.length} items for column ${column.id}`);
              return items.map(item => ({
                label: String(item.label || ''),
                value: String(item.value || '')
              }));
            }
          }
        } catch (e) {
          console.error(`Failed to process special format for column ${column.id}:`, e);
        }
      }
      
      // 2. Normal JSON parse
      try {
        const parsedOptions = JSON.parse(optionsStr);
        console.log(`Standard JSON parse result for column ${column.id}:`, parsedOptions);
        
        // Əgər array-dirsə
        if (Array.isArray(parsedOptions)) {
          return parsedOptions.map((opt: any) => {
            if (typeof opt === 'string') {
              return { label: opt, value: opt };
            } else if (opt && typeof opt === 'object') {
              if ('label' in opt && 'value' in opt) {
                return { label: String(opt.label), value: String(opt.value) };
              }
            }
            return { label: String(opt), value: String(opt) };
          });
        }
        
        // Əgər obyektdirsə
        if (parsedOptions && typeof parsedOptions === 'object') {
          return Object.entries(parsedOptions).map(([key, value]) => ({
            label: String(value),
            value: key
          }));
        }
      } catch (e) {
        console.warn(`Standard JSON parse failed for column ${column.id}:`, e);
      }
      
      // 3. Əgər heç bir parse işləmirsə, string-i birbaşa istifadə edirik
      return [{ label: optionsStr, value: optionsStr }];
    }
    
    // Əgər options obyekt formatındadırsa (amma array deyilsə)
    if (column.options && typeof column.options === 'object' && !Array.isArray(column.options)) {
      console.log(`Column ${column.id} has object options:`, column.options);
      
      try {
        return Object.entries(column.options).map(([key, value]) => ({
          label: String(value),
          value: key
        }));
      } catch (e) {
        console.warn(`Failed to process object options for column ${column.id}:`, e);
      }
    }
    
    // Əgər heç bir format uyğun gəlmirsə, default options yaradaq
    if (column.type === 'select') {
      console.warn(`Using default options for column ${column.id} (${column.name})`);
      return [
        { label: 'Seçim 1', value: 'option1' },
        { label: 'Seçim 2', value: 'option2' },
        { label: 'Seçim 3', value: 'option3' }
      ];
    }
    
    // Xəta halında və ya digər hallarda boş massiv qaytarırıq
    return [];
  }, [column.options, column.type, column.id, column.name]);

  // Debug məqsədilə options-ları konsola yazdırırıq
  React.useEffect(() => {
    console.log(`Final options for column ${column.id} (${column.name}):`, {
      original: column.options,
      originalType: typeof column.options,
      isArray: Array.isArray(column.options),
      processed: options,
      processedCount: options.length
    });
  }, [column.id, column.name, column.options, options]);

  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {column.name}
            {column.is_required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value ? String(field.value) : undefined}
            disabled={disabled || options.length === 0}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçin...'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.length > 0 ? (
                options.map((option, index) => (
                  <SelectItem 
                    key={`${option.value}-${index}`} 
                    value={String(option.value || `option-${index}`)}
                  >
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no_options" disabled>
                  Seçim variantları mövcud deyil
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectInput;
