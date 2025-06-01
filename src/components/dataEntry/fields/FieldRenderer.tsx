import React from 'react';
import { Column } from '@/types/column';
import Field, { ControlledAdapter } from './Field';

export interface FieldRendererProps {
  column: Column;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

/**
 * FieldRenderer - geriyə uyğunluq üçün wrapper komponenti
 * Daxildə yeni Field komponentindən istifadə edir, kontrollu komponent kimi işləyir
 */
const FieldRenderer: React.FC<FieldRendererProps> = ({
  column,
  value,
  onChange,
  onValueChange,
  isDisabled = false
}) => {
  // Təhlükəsizlik yoxlanışı
  if (!column) {
    console.warn('FieldRenderer received undefined column');
    return null;
  }
  
  if (!column.id) {
    console.warn('FieldRenderer received column without ID', column);
    return null;
  }
  
  // Kontrollu komponent adapter yaradırıq
  const adapter = React.useMemo(() => {
    // Xəta vəziyyətini izləmək üçün state
    const errors: Record<string, string> = {};
    
    // onValueChange və onChange'i birləşdirən funksiya
    const handleChange = (name: string, newValue: any) => {
      try {
        // Əgər onValueChange varsa, onu çağır
        if (typeof onValueChange === 'function') {
          onValueChange(newValue);
          return;
        }
        
        // Əks halda, onChange funksiyasını simülyasiya et
        if (typeof onChange === 'function') {
          // Saxta hadisə obyekti yaradırıq
          const syntheticEvent = {
            target: {
              name,
              value: newValue,
              type: typeof newValue === 'boolean' ? 'checkbox' : 'text'
            },
            preventDefault: () => {}
          } as React.ChangeEvent<any>;
          
          onChange(syntheticEvent);
        }
      } catch (err) {
        console.error(`Error in onChange/onValueChange for column ${name}:`, err);
        errors[name] = 'An error occurred during value change';
      }
    };
    
    // Kontrollu adapter yaradırıq
    return new ControlledAdapter({
      value: { [column.id]: value },
      onChange: handleChange,
      errors,
      submitting: false
    });
  }, [column.id, value, onChange, onValueChange]);
  
  // Vahid Field komponentini qaytarırıq
  return (
    <Field
      column={column}
      adapter={adapter}
      disabled={isDisabled}
      readOnly={false}
    />
  );
};

export default FieldRenderer;
