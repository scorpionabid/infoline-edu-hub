import React, { useEffect, useState } from 'react';
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
import { AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface SelectInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

/**
 * Müxtəlif formatlarda olan options sahəsini standart formata çevirir
 * @param options - İşlənəcək options sahəsi
 * @param columnId - Xəta mesajları üçün sütun ID-si
 * @param columnName - Xəta mesajları üçün sütun adı
 * @returns Standartlaşdırılmış options massivi
 */
const processOptions = (options: any, columnId: string, columnName: string): ColumnOption[] => {
  try {
    // Əgər options yoxdursa, boş massiv qaytarırıq
    if (!options) {
      return [];
    }
    
    // Əgər options artıq array formatındadırsa və içində obyektlər varsa
    if (Array.isArray(options)) {
      return options.map((opt: any) => {
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
    if (typeof options === 'string') {
      const optionsStr = options.trim();
      
      // Boş string-dirsə, boş massiv qaytarırıq
      if (!optionsStr) {
        return [];
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
          const parsedArray = JSON.parse(jsonStr);
          if (Array.isArray(parsedArray) && parsedArray.length > 0) {
            return parsedArray.map(item => ({
              label: String(item.label || ''),
              value: String(item.value || '')
            }));
          }
        } catch (jsonError) {
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
              return null;
            }
          }).filter(Boolean);
          
          if (items.length > 0) {
            return items.map(item => ({
              label: String(item.label || ''),
              value: String(item.value || '')
            }));
          }
        }
      }
      
      // 2. Normal JSON parse
      try {
        const parsedOptions = JSON.parse(optionsStr);
        
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
        // Əgər JSON parse alınmırsa, vergüllə ayrılmış siyahı kimi qəbul edirik
        const commaOptions = optionsStr.split(',')
          .map(opt => opt.trim())
          .filter(opt => opt)
          .map(opt => ({ label: opt, value: opt }));
          
        if (commaOptions.length > 0) {
          return commaOptions;
        }
      }
      
      // Əgər heç bir parse işləmirsə, string-i birbaşa istifadə edirik
      return [{ label: optionsStr, value: optionsStr }];
    }
    
    // Əgər options obyekt formatındadırsa (amma array deyilsə)
    if (options && typeof options === 'object' && !Array.isArray(options)) {
      try {
        return Object.entries(options).map(([key, value]) => ({
          label: String(value),
          value: key
        }));
      } catch (e) {
        // Xəta halında boş massiv qaytarırıq
        return [];
      }
    }
    
    // Xəta halında və ya digər hallarda boş massiv qaytarırıq
    return [];
  } catch (error) {
    console.error(`Error processing options for column ${columnId} (${columnName}):`, error);
    return [];
  }
};

const SelectInput: React.FC<SelectInputProps> = ({ column, form, disabled = false }) => {
  const { t } = useLanguage();
  const [optionsError, setOptionsError] = useState<string | null>(null);
  
  // Sütun seçənəklərini dönüşdür
  const options = React.useMemo(() => {
    try {
      // Əvvəlki xətaları təmizləyirik
      setOptionsError(null);
      
      // Options sahəsini işləyirik
      const processedOptions = processOptions(column.options, column.id, column.name);
      
      // Əgər options boşdursa və sütun tipi select-dirsə, xəta qeyd edirik
      if (processedOptions.length === 0 && column.type === 'select') {
        const errorMessage = `${column.name || column.id} sütunu üçün seçimlər tapılmadı`;
        setOptionsError(errorMessage);
        console.warn(errorMessage, {
          columnId: column.id,
          columnName: column.name,
          options: column.options
        });
        
        // Default seçimlər qaytarırıq
        return [
          { label: 'Seçim 1', value: 'option1' },
          { label: 'Seçim 2', value: 'option2' },
          { label: 'Seçim 3', value: 'option3' }
        ];
      }
      
      return processedOptions;
    } catch (error) {
      // Xəta halında xəta mesajını qeyd edirik
      const errorMessage = `${column.name || column.id} sütunu üçün seçimləri işləyərkən xəta`;
      setOptionsError(errorMessage);
      console.error(errorMessage, error);
      
      // Default seçimlər qaytarırıq
      return [
        { label: 'Seçim 1', value: 'option1' },
        { label: 'Seçim 2', value: 'option2' },
        { label: 'Seçim 3', value: 'option3' }
      ];
    }
  }, [column.options, column.type, column.id, column.name]);

  // Xəta halında istifadəçini məlumatlandırırıq
  useEffect(() => {
    if (optionsError) {
      toast.error(t('optionsError'), {
        description: optionsError,
        duration: 5000,
        id: `options-error-${column.id}`
      });
    }
  }, [optionsError, column.id, t]);

  const hasOptions = options.length > 0;
  const hasError = !!optionsError;

  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>
              {column.name}
              {column.is_required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            {hasError && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{optionsError || t('optionsLoadError')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              value={field.value ? String(field.value) : undefined}
              disabled={disabled}
            >
              <SelectTrigger className={hasError ? "border-amber-300" : ""}>
                <SelectValue placeholder={column.placeholder || t('selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {hasOptions ? (
                  options.map((option, index) => (
                    <SelectItem key={`${option.value}-${index}`} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))
                ) : (
                  // Əgər seçimlər yoxdursa, default seçimlər göstəririk
                  <>
                    <SelectItem value="option1">Seçim 1</SelectItem>
                    <SelectItem value="option2">Seçim 2</SelectItem>
                    <SelectItem value="option3">Seçim 3</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SelectInput;
