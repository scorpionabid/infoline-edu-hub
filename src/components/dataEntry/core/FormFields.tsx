import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import Field, { ReactHookFormAdapter } from '../fields/Field';

// Define proper types
interface FormFieldsProps {
  columns?: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * FormFields - Form sütunlarını render edən komponent
 * Yeni Field komponentindən və ReactHookFormAdapter-dən istifadə edir
 */
const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Defensively filter columns to ensure all are valid using our utility functions
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
        // Additional UUID validation - checking if id is a valid string
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
  
  // Form konteksti yoxdursa
  if (!formContext) {
    console.error('FormFields: No form context found');
    return <div className="p-4 text-red-500">Form konteksti tapılmadı</div>;
  }
  
  // React Hook Form adapter
  const adapter = React.useMemo(() => {
    return new ReactHookFormAdapter(formContext);
  }, [formContext]);
  
  return (
    <div className="grid gap-6">
      {safeColumns.map(column => (
        <FormField
          key={column.id}
          control={formContext.control}
          name={column.id}
          render={() => (
            <FormItem>
              <FormLabel>
                {column.name}
                {column.is_required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Field
                  column={column}
                  adapter={adapter}
                  disabled={disabled}
                  readOnly={readOnly}
                />
              </FormControl>
              {column.description && (
                <FormDescription>
                  {column.description}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      
      {safeColumns.length === 0 && (
        <div className="py-4 text-center text-muted-foreground">
          Forma üçün sahələr tapılmadı.
        </div>
      )}
    </div>
  );
};

export default FormFields;
