
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column, ColumnOption } from '@/types/column';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SelectInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ column, form, disabled = false }) => {
  // Varsayılan seçenekler oluşturalım eğer seçenekler belirtilmemişse
  const options: ColumnOption[] = React.useMemo(() => {
    if (column.options && Array.isArray(column.options)) {
      return column.options.map(option => ({
        ...option,
        // Eğer id eksikse oluşturalım
        id: option.id || `option-${option.value}`
      }));
    }

    // Eğer default_value varsa, bundan seçenekler oluşturalım
    if (column.default_value && typeof column.default_value === 'string') {
      const values = column.default_value.split(',').map(v => v.trim());
      return values.map((value, index) => ({
        id: `option-${index}`,
        label: value,
        value: value
      }));
    }

    return [];
  }, [column.options, column.default_value]);

  if (column.type === 'radio') {
    return (
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
                disabled={disabled}
                className="flex flex-col space-y-1"
              >
                {options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.id} />
                    <Label htmlFor={option.id}>{option.label}</Label>
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
  }

  if (column.type === 'checkbox') {
    return (
      <FormField
        control={form.control}
        name={`fields.${column.id}`}
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>{column.name}</FormLabel>
              {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option) => (
                <FormField
                  key={option.id}
                  control={form.control}
                  name={`fields.${column.id}`}
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={option.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              const updatedValue = checked
                                ? [...currentValue, option.value]
                                : currentValue.filter((value: string) => value !== option.value);
                              field.onChange(updatedValue);
                            }}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Default seçim kutusu
  return (
    <FormField
      control={form.control}
      name={`fields.${column.id}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{column.name}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={column.placeholder || 'Seçin'} />
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
};

export default SelectInput;
