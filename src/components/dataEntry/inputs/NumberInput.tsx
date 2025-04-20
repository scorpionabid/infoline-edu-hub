
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/context/LanguageContext';
import { ValidationRules } from '@/types/column';

interface NumberInputProps {
  column: {
    id: string;
    name: string;
    is_required?: boolean;
    help_text?: string;
    validation?: ValidationRules;
  };
  form: any;
  disabled?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({ column, form, disabled = false }) => {
  const { t } = useLanguage();
  
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
          <FormControl>
            <Input
              {...field}
              type="number"
              placeholder={column.help_text}
              disabled={disabled}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                field.onChange(value);
              }}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NumberInput;
