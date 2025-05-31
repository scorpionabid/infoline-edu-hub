import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Column } from '@/types/column';
import { useFormContext } from 'react-hook-form';
import FieldRendererSimple from '../fields/FieldRendererSimple';

// Define proper types
interface FormFieldsProps {
  columns?: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({ columns = [], disabled = false, readOnly = false }) => {
  // Form values tracking - dəyərləri lokal state-də saxlamaq üçün
  const [localValues, setLocalValues] = React.useState<Record<string, any>>({});
  
  // Props diaqnostikası üçün
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('FormFields props diagnostics');
      console.log('FormFields received props:', { disabled, readOnly });
      console.log('FormFields local values:', localValues);
      console.groupEnd();
    }
  }, [disabled, readOnly, localValues]);
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
  
  // Form context not available - static render
  if (!formContext) {
    return (
      <div className="space-y-6">
        {safeColumns.map(column => (
          <div key={column.id} className="grid gap-2">
            <div className="font-medium">{column.name}</div>
            <FieldRendererSimple
              type={column.type}
              value=""
              onChange={() => {}}
              disabled={true}
              required={!!column.is_required}
              readOnly={true}
              options={column.options}
            />
            {column.description && (
              <p className="text-sm text-muted-foreground">
                {column.description}
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
            control={formContext.control}
            name={column.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {column.name}
                  {column.is_required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <FieldRendererSimple
                    type={column.type}
                    // Lokal state-dən və ya RHF-dən dəyəri götürmək
                    value={localValues[column.id] !== undefined ? localValues[column.id] : (field.value || '')} 
                    onChange={(newValue) => {
                      try {
                        // Həm lokal state-ə, həm də form state-ə dəyəri yazaq
                        setLocalValues(prev => ({
                          ...prev,
                          [column.id]: newValue
                        }));
                        
                        // React Hook Form state-ini yenilə 
                        field.onChange(newValue);
                        
                        // Focus dəyişməsini simulyasiya edərək yeniləməni tətiklundər
                        try { field.onBlur(); } catch (err) {}
                        
                        // Debug
                        if (process.env.NODE_ENV === 'development') {
                          console.log(`FormFields onChange for ${column.id}:`, { 
                            newValue, 
                            fieldName: field.name 
                          });
                        }
                      } catch (err) {
                        console.error(`Error updating field ${column.id}:`, err);
                      }
                    }}
                    onBlur={() => {
                      try {
                        field.onBlur();
                      } catch (err) {
                        console.error(`Error on field blur ${column.id}:`, err);
                      }
                    }}
                    // Parent komponentdən gələn props-ları istifadə edirik
                    disabled={disabled} 
                    required={!!column.is_required}
                    readOnly={readOnly} 
                    // Seçim variantlarını təmin etmək (select, radio kimi sahələr üçün)
                    options={Array.isArray(column.options) ? column.options : []}
                    placeholder={column.placeholder || ''}
                    name={column.id}
                    id={column.id}
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
        );
      })}
      
      {safeColumns.length === 0 && (
        <div className="py-4 text-center text-muted-foreground">
          No fields found for this form.
        </div>
      )}
    </div>
  );
};

export default FormFields;
