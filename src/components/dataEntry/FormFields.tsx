
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import FieldRenderer from './fields/FieldRenderer';

// Define proper types
interface FormFieldsProps {
  columns?: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

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
          safeColumns.map((column) => {
            if (!column || !column.id) return null;
            
            return (
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
            );
          })
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
        safeColumns.map((column) => {
          // Enhanced protection against invalid column objects
          if (!column || typeof column !== 'object') {
            console.warn('FormFields skipping non-object column:', column);
            return null;
          }
          
          // Strong validation for column.id to ensure it's a valid string
          if (!column.id || typeof column.id !== 'string') {
            console.warn('FormFields skipping column with invalid ID:', column);
            return null;
          }
          
          // For debugging - log important column info
          if (process.env.NODE_ENV === 'development') {
            console.debug(`Rendering column: ${column.id}, name: ${column.name || 'unnamed'}`);
          }
          
          try {
            return (
              <FormField
                key={column.id}
                control={control}
                name={column.id}
                render={({ field }) => {
                // Enhanced defensive check for field object
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
                
                // Add safety for column value access
                const safeValue = field.value !== undefined && field.value !== null
                  ? field.value
                  : '';
                  
                // Create a safe onChange handler that won't break on errors
                const safeOnChange = (value: any) => {
                  try {
                    field.onChange(value);
                  } catch (err) {
                    console.error(`Error changing field ${column.id}:`, err);
                  }
                };
                
                return (
                  <FormItem>
                    <FormLabel>
                      {column.name || 'Unnamed Field'}
                      {column.is_required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      <FieldRenderer
                        column={column}
                        value={safeValue}
                        onChange={safeOnChange}
                        onValueChange={safeOnChange}
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
          );
          } catch (error) {
            // Catch any render errors at the column level to prevent form crash
            console.error(`Error rendering column ${column?.id || 'unknown'}:`, error);
            return (
              <div key={column.id || Math.random().toString()} className="p-3 border border-red-200 rounded bg-red-50">
                <p className="text-sm text-red-500">Error rendering field: {column.name || 'Unknown'}</p>
              </div>
            );
          }
        })
      ) : (
        <div className="text-sm text-gray-500">No fields available</div>
      )}
    </div>
  );
};

export default FormFields;
