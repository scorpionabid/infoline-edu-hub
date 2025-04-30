
import React, { useEffect, useState } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { Column, ColumnOption } from '@/types/column';
import { Label } from '@/components/ui/label';

interface SelectInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ column, form, disabled = false }) => {
  const [options, setOptions] = useState<ColumnOption[]>([]);
  
  // Parse options from column
  useEffect(() => {
    if (column.options && Array.isArray(column.options)) {
      // Əgər options array olarsa birbaşa istifadə et
      setOptions(column.options.map(opt => 
        typeof opt === 'object' && opt !== null ? 
          { id: opt.id || opt.value || String(Math.random()), ...opt } : // id əlavə et
          { id: String(Math.random()), label: String(opt), value: String(opt) } // sadə dəyər üçün obyekt yarat
      ));
    } else if (column.options && typeof column.options === 'object') {
      // Əgər options obyekt olarsa onu array-ə çevir
      const optArray = Object.entries(column.options).map(([key, value]) => ({
        id: key,
        label: String(value),
        value: key
      }));
      setOptions(optArray);
    } else if (typeof column.options === 'string') {
      // Əgər options string olarsa, vergülə görə ayır
      try {
        // JSON parse etməyə çalış
        const parsedOptions = JSON.parse(column.options);
        if (Array.isArray(parsedOptions)) {
          setOptions(parsedOptions.map(opt => ({ 
            id: opt.id || opt.value || String(Math.random()),
            label: opt.label || String(opt),
            value: opt.value || String(opt)
          })));
        }
      } catch (e) {
        // Əgər JSON parse alınmazsa, vergülə görə ayır
        const stringOptions = column.options.split(',').map(opt => opt.trim());
        setOptions(stringOptions.map(opt => ({ 
          id: opt, 
          label: opt, 
          value: opt 
        })));
      }
    } else {
      // Default options
      setOptions([
        { id: '1', label: 'Option 1', value: '1' },
        { id: '2', label: 'Option 2', value: '2' },
        { id: '3', label: 'Option 3', value: '3' }
      ]);
    }
  }, [column.options]);

  // Render select input
  const renderSelect = () => (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{column.name}</FormLabel>
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçin...'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  // Render radio group
  const renderRadioGroup = () => (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>{column.name}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className="flex flex-col space-y-1"
              disabled={disabled}
            >
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`radio-${column.id}-${option.id}`} />
                  <Label htmlFor={`radio-${column.id}-${option.id}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return column.type === 'radio' ? renderRadioGroup() : renderSelect();
};

export default SelectInput;
