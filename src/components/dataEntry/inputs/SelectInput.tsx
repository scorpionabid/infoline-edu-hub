
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';
import { ColumnOption } from '@/types/column';

interface SelectInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  helpText?: string;
  options?: ColumnOption[];
  disabled?: boolean;
  className?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  optionsString?: string;
}

export function SelectInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Seçin',
  helpText,
  options = [],
  disabled = false,
  className = '',
  required = false,
  onChange,
  optionsString
}: SelectInputProps<T>) {
  const [selectOptions, setSelectOptions] = useState<ColumnOption[]>([]);

  useEffect(() => {
    if (options && options.length > 0) {
      setSelectOptions(options);
    } else if (optionsString) {
      try {
        // optionsString formatı kontrol et
        if (optionsString.startsWith('[') && optionsString.endsWith(']')) {
          // JSON array formatı
          const parsedOptions = JSON.parse(optionsString);
          const formattedOptions: ColumnOption[] = parsedOptions.map((opt: any, index: number) => ({
            id: opt.id || `option-${index}`,
            label: opt.label,
            value: opt.value
          }));
          setSelectOptions(formattedOptions);
        } else if (optionsString.includes('{') && optionsString.includes('}')) {
          // Özəl format - JSON obyektlər siyahısı şəklində olan string
          try {
            // "[{...},{...}]" formatına çevir
            const jsonStr = `[${optionsString}]`;
            const parsedOptions = JSON.parse(jsonStr);
            const formattedOptions: ColumnOption[] = parsedOptions.map((opt: any, index: number) => ({
              id: opt.id || `option-${index}`,
              label: opt.label,
              value: opt.value
            }));
            setSelectOptions(formattedOptions);
          } catch (innerErr) {
            console.error('Daxili parse xətası:', innerErr);
            // Fallback: Sadə virgüllə ayrılmış siyahı kimi emal et
            const parts = optionsString.split(',').map(part => part.trim());
            const formattedOptions: ColumnOption[] = parts.map((part, index) => ({
              id: `option-${index}`,
              label: part,
              value: part.toLowerCase().replace(/\s+/g, '_')
            }));
            setSelectOptions(formattedOptions);
          }
        } else {
          // Sadə virgüllə ayrılmış siyahı kimi emal et
          const parts = optionsString.split(',').map(part => part.trim());
          const formattedOptions: ColumnOption[] = parts.map((part, index) => ({
            id: `option-${index}`,
            label: part,
            value: part.toLowerCase().replace(/\s+/g, '_')
          }));
          setSelectOptions(formattedOptions);
        }
      } catch (err) {
        console.error('Options parse xətası:', err);
        // Sadə text kimi emal et
        const formattedOptions: ColumnOption[] = [{
          id: 'option-0',
          label: optionsString,
          value: optionsString.toLowerCase().replace(/\s+/g, '_')
        }];
        setSelectOptions(formattedOptions);
      }
    } else {
      // Default boş siyahı
      setSelectOptions([]);
    }
  }, [options, optionsString]);

  const handleValueChange = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                handleValueChange(value);
              }}
              defaultValue={field.value}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {helpText && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
