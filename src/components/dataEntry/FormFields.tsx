
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormFieldProps, FormFieldsProps } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import FieldRenderer from './fields/FieldRenderer';

// Main component to render a collection of form fields
const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Ensure columns is always an array with valid items
  const safeColumns = Array.isArray(columns) ? columns.filter(col => col && col.id) : [];
  const formContext = useFormContext();
  
  // Form context not available - static render
  if (!formContext) {
    return (
      <div className="space-y-6">
        {safeColumns.map((column) => (
          <div key={column.id} className="space-y-1">
            <label className="text-sm font-medium" htmlFor={column.id}>
              {column.name || 'Unnamed Field'}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <FieldRenderer
              column={column}
              value=""
              onChange={() => {}}
              onValueChange={() => {}}
              isDisabled={disabled || readOnly}
            />
            {column.help_text && <p className="text-xs text-gray-500">{column.help_text}</p>}
          </div>
        ))}
      </div>
    );
  }

  // Form context available - render with form connection
  const { control } = formContext;
  
  return (
    <div className="space-y-6">
      {safeColumns.map((column) => (
        <FormField
          key={column.id}
          control={control}
          name={column.id}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {column.name || 'Unnamed Field'}
                {column.is_required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <FieldRenderer
                  column={column}
                  value={field?.value}
                  onChange={field?.onChange}
                  onValueChange={field?.onChange}
                  isDisabled={disabled || readOnly}
                />
              </FormControl>
              {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
              {column.description && !column.help_text && (
                <FormDescription>{column.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default FormFields;
