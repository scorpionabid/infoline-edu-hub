
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FormFieldProps, FormFieldsProps } from '@/types/dataEntry';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import FieldRenderer from './fields/FieldRenderer';

// Main component to render a collection of form fields
const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Defensively filter columns to ensure all are valid
  const safeColumns = React.useMemo(() => {
    try {
      if (!Array.isArray(columns)) {
        console.warn('FormFields received non-array columns:', columns);
        return [];
      }
      
      return columns.filter(col => {
        if (!col || typeof col !== 'object') {
          console.warn('FormFields found invalid column:', col);
          return false;
        }
        if (!col.id) {
          console.warn('FormFields found column without ID:', col);
          return false;
        }
        return true;
      });
    } catch (err) {
      console.error('Error filtering columns in FormFields:', err);
      return [];
    }
  }, [columns]);
    
  const formContext = useFormContext();
  
  // Form context not available - static render
  if (!formContext) {
    return (
      <div className="space-y-6">
        {safeColumns.length > 0 ? (
          safeColumns.map((column) => (
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
          ))
        ) : (
          <div className="text-sm text-gray-500">No fields available</div>
        )}
      </div>
    );
  }

  // Form context available - render with form connection
  const { control } = formContext;
  
  if (!control) {
    console.warn('Form control not available in FormFields');
    return <div className="text-sm text-red-500">Form configuration error</div>;
  }
  
  return (
    <div className="space-y-6">
      {safeColumns.length > 0 ? (
        safeColumns.map((column) => (
          <FormField
            key={column.id}
            control={control}
            name={column.id}
            render={({ field }) => {
              // Defensive check for field object
              if (!field) {
                console.warn(`Field object is undefined for column ${column.id}`);
                return (
                  <FormItem>
                    <FormLabel>{column.name || 'Unnamed Field'}</FormLabel>
                    <FormControl>
                      <div className="text-red-500">Error loading field</div>
                    </FormControl>
                  </FormItem>
                );
              }
              
              return (
                <FormItem>
                  <FormLabel>
                    {column.name || 'Unnamed Field'}
                    {column.is_required && <span className="text-destructive ml-1">*</span>}
                  </FormLabel>
                  <FormControl>
                    <FieldRenderer
                      column={column}
                      value={field.value}
                      onChange={field.onChange}
                      onValueChange={field.onChange}
                      isDisabled={disabled || readOnly}
                    />
                  </FormControl>
                  {column.help_text && <FormDescription>{column.help_text}</FormDescription>}
                  {column.description && !column.help_text && (
                    <FormDescription>{column.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        ))
      ) : (
        <div className="text-sm text-gray-500">No fields available</div>
      )}
    </div>
  );
};

export default FormFields;
