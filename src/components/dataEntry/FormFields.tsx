
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import FieldRendererSimple from './fields/FieldRendererSimple';

interface FormFieldsProps {
  columns?: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Safe columns filtering with enhanced validation
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
        if (typeof col.id !== 'string' || col.id.trim() === '') {
          console.warn('FormFields found column with invalid ID format:', col.id);
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
  
  // Form context not available - render static fields
  if (!formContext) {
    console.warn('FormFields: No form context available, rendering static fields');
    return (
      <div className="space-y-6">
        {safeColumns.map(column => (
          <div key={column.id} className="grid gap-2">
            <div className="font-medium">
              {column.name}
              {column.is_required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <FieldRendererSimple
              type={column.type}
              value=""
              onChange={() => {}}
              disabled={true}
              required={!!column.is_required}
              readOnly={true}
              options={column.options}
              placeholder={column.placeholder}
            />
            {column.help_text && (
              <p className="text-sm text-muted-foreground">
                {column.help_text}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6 py-2">
      {safeColumns.map(column => {
        // Skip columns with invalid IDs
        if (!column.id || typeof column.id !== 'string') {
          console.warn('Skipping column with invalid ID:', column);
          return null;
        }
        
        return (
          <FormField
            key={column.id}
            name={column.id}
            disabled={disabled || readOnly}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {column.name}
                  {column.is_required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <FieldRendererSimple
                    type={column.type}
                    value={field.value || ''}
                    onChange={(value) => {
                      // Enhanced onChange with proper validation
                      try {
                        if (typeof field.onChange === 'function') {
                          field.onChange(value);
                        } else {
                          console.warn('FormFields: field.onChange is not a function for column:', column.id);
                        }
                      } catch (err) {
                        console.error('FormFields: Error calling field.onChange:', err);
                      }
                    }}
                    disabled={disabled || readOnly}
                    required={!!column.is_required}
                    readOnly={readOnly}
                    options={column.options}
                    placeholder={column.placeholder}
                  />
                </FormControl>
                {column.help_text && (
                  <FormDescription>
                    {column.help_text}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
};

export default FormFields;
