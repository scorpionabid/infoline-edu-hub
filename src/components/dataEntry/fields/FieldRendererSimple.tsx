
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnType } from '@/types/column';

interface FieldRendererSimpleProps {
  type: ColumnType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  options?: any[];
  placeholder?: string;
}

const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({
  type,
  value,
  onChange,
  disabled = false,
  required = false,
  readOnly = false,
  options = [],
  placeholder = ''
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleSelectChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked ? 'true' : 'false');
  };

  switch (type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
          placeholder={placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
          placeholder={placeholder}
          rows={4}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
          placeholder={placeholder}
        />
      );

    case 'email':
      return (
        <Input
          type="email"
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
          placeholder={placeholder}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
        />
      );

    case 'select':
      // Variantları işləmək üçün Xüsusi Funksiya
      // Supabase-dən gələn məlumatları düzgün formatına gətirən köməkçi funksiya
      const fixDbOptionsFormat = (rawOptions: any): any[] => {
        console.log('Fixing DB options format for:', rawOptions);
        
        // 1. Null və ya undefined yoxlaması
        if (rawOptions === null || rawOptions === undefined) {
          console.log('Raw options is null or undefined');
          return [];
        }
        
        // 2. Əgər artıq massivdirsə
        if (Array.isArray(rawOptions)) {
          // Massiv boşdursa
          if (rawOptions.length === 0) {
            console.log('Raw options is an empty array');
            return [];
          }
          
          // Massiv element stringdirsə və JSON ola bilərsə
          if (rawOptions.length === 1 && typeof rawOptions[0] === 'string') {
            try {
              // Məsələn, ['[{"label":"Option 1","value":"opt1"}]'] formatında ola bilər
              const innerContent = rawOptions[0];
              if (innerContent.startsWith('[') && innerContent.endsWith(']')) {
                const parsedInner = JSON.parse(innerContent);
                console.log('Parsed inner JSON array:', parsedInner);
                return Array.isArray(parsedInner) ? parsedInner : []; 
              }
            } catch(e) {
              console.error('Error parsing inner JSON string:', e);
            }
          }
          
          // Hər bir element objektdirsə və label/value var isa, birbaşa qaytar
          if (typeof rawOptions[0] === 'object' && rawOptions[0] !== null) {
            if ('label' in rawOptions[0] && 'value' in rawOptions[0]) {
              console.log('Options already in correct format');
              return rawOptions;
            }
          }
        }
        
        // 3. String formatında JSON
        if (typeof rawOptions === 'string') {
          try {
            // Escape edilmiş simvolları düzəlt
            let cleanString = rawOptions;
            if (rawOptions.includes('\\"')) {
              cleanString = rawOptions.replace(/\\\"([^\\\"]*)\\\"/g, '"$1"');
              console.log('Fixed escaped quotes:', cleanString);
            }
            
            const parsedOptions = JSON.parse(cleanString);
            console.log('Successfully parsed JSON string:', parsedOptions);
            if (Array.isArray(parsedOptions)) {
              return parsedOptions;
            }
          } catch(e) {
            console.error('Error parsing options string:', e);
          }
        }
        
        // 4. Bazadan JSON objekti kimi gələn məlumatlar
        if (typeof rawOptions === 'object' && rawOptions !== null && !Array.isArray(rawOptions)) {
          // {0: {label: "...", value: "..."}, 1: {label: "...", value: "..."}} formatı
          if (Object.keys(rawOptions).length > 0) {
            try {
              const arrayOptions = Object.values(rawOptions);
              console.log('Converted object to array:', arrayOptions);
              return arrayOptions;
            } catch(e) {
              console.error('Error converting object to array:', e);
            }
          }
        }
        
        // 5. Digər halları emal et
        console.warn('Could not process options format:', rawOptions);
        return [];
      };
      
      // Bazadan gələn variantları emal edirik
      const processedOptions = React.useMemo(() => {
        const fixedOptions = fixDbOptionsFormat(options);
        
        // Variantların olub-olmadığını yoxla
        if (!fixedOptions || !Array.isArray(fixedOptions) || fixedOptions.length === 0) {
          console.log('No valid options found after processing');
          
          // Əgər placeholder və ya sütun adından kontekstual variantlar yarat
          const lowerPlaceholder = (placeholder || '').toLowerCase();
          
          // Kontekstual variantlar
          if (lowerPlaceholder.includes('bilər') || lowerPlaceholder.includes('ola')) {
            return [
              { value: 'ola_bilar', label: 'Ola bilər' },
              { value: 'ola_bilmez', label: 'Ola bilməz' }
            ];
          } else if (lowerPlaceholder.includes('vəziyyət') || lowerPlaceholder.includes('halı')) {
            return [
              { value: 'yaxsi', label: 'Yaxşı' },
              { value: 'orta', label: 'Orta' },
              { value: 'pis', label: 'Pis' }
            ];
          } else {
            return [
              { value: 'variant1', label: 'Variant 1' },
              { value: 'variant2', label: 'Variant 2' },
              { value: 'variant3', label: 'Variant 3' }
            ];
          }
        }
        
        return fixedOptions;
      }, [options, placeholder]);
      
      return (
        <div className="relative w-full">
          {/* Debug info - sətrin üstündə göstər */}
          {!processedOptions.length && (
            <div className="text-xs text-red-500 mb-1">
              No options available (Debug: {JSON.stringify(options)})
            </div>
          )}
          
          <select
            value={value} 
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={false}
            required={required}
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {/* Default "Select an option" sətiri */}
            <option value="_empty_" disabled>
              {placeholder || 'Select an option'}
            </option>
            
            {/* Opciyaları render edirik */}
            {processedOptions.length > 0 ? processedOptions.map((option, index) => {
              // Opciya formatlarını müxtəlif hallara uyğunlaşdırırıq
              let optionValue, optionLabel;
              
              if (typeof option === 'object' && option !== null) {
                // {label, value} formatı
                if ('label' in option && 'value' in option) {
                  optionLabel = option.label;
                  optionValue = option.value;
                } 
                // {id, name} formatı
                else if ('id' in option && 'name' in option) {
                  optionLabel = option.name;
                  optionValue = option.id;
                }
                // {key, text} formatı 
                else if ('key' in option && 'text' in option) {
                  optionLabel = option.text;
                  optionValue = option.key;
                }
                // Digər format
                else {
                  // Obyektin ilk string dəyərini istifadə et
                  const entries = Object.entries(option);
                  if (entries.length > 0) {
                    optionLabel = String(entries[0][1]); 
                    optionValue = String(entries[0][0]);
                  } else {
                    optionLabel = `Option ${index}`;
                    optionValue = `option_${index}`;
                  }
                }
              } else {
                // Primitiv dəyər (string, number)
                optionLabel = String(option);
                optionValue = String(option);
              }
              
              // Boş dəyərlərdən qorun
              const safeValue = optionValue || `option_${index}`;
              const safeLabel = optionLabel || safeValue;
              
              return (
                <option 
                  key={`${index}-${safeValue}`} 
                  value={safeValue}
                >
                  {safeLabel}
                </option>
              );
            }) : (
              <option value="no_options" disabled>
                No options available
              </option>
            )}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={value === 'true'}
            onCheckedChange={handleCheckboxChange}
            disabled={false} 
            required={required}
          />
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {placeholder}
          </label>
        </div>
      );

    case 'file':
      return (
        <Input
          type="file"
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={false} 
          readOnly={false} 
          required={required}
          placeholder={placeholder}
        />
      );
  }
};

export default FieldRendererSimple;
