
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Column } from '@/types/column';

interface CheckboxInputProps {
  column: Column;
  form: UseFormReturn<any>;
  disabled?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ column, form, disabled = false }) => {
  // Sütun seçənəklərini dönüşdür
  const options = React.useMemo(() => {
    if (!column.options) return [];
    
    if (Array.isArray(column.options)) {
      return column.options.map((option: any) => {
        if (typeof option === 'string') {
          return { label: option, value: option };
        }
        return option;
      });
    }
    
    return [];
  }, [column.options]);

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
          <div className="flex flex-col space-y-2">
            {options.map((option, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`fields.${column.id}`}
                render={({ field: childField }) => {
                  const values = Array.isArray(childField.value) ? childField.value : [];
                  return (
                    <FormItem
                      key={option.value}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={values.includes(option.value)}
                          disabled={disabled}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              childField.onChange([...values, option.value]);
                            } else {
                              childField.onChange(values.filter((val: string) => val !== option.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">{option.label}</FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
          </div>
          {column.help_text && (
            <FormDescription>{column.help_text}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CheckboxInput;
