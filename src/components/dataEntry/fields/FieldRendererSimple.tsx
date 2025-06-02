
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Field, { ReactHookFormAdapter } from './Field';
import { Column, ColumnType } from '@/types/column';

// İnterfeysləri saxlayırıq ki, geriyə uyğunluq olsun
export type { ColumnType };

export interface FieldProps {
  type?: ColumnType;
  columnType?: ColumnType;
  column?: Column;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  validation?: any;
  options?: any[];
  onBlur?: () => void;
}

interface FieldRendererSimpleProps {
  type?: ColumnType;
  column?: Column;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<any>) => void;
  id?: string;
  name?: string;
}

/**
 * FieldRendererSimple - geriyə uyğunluq üçün wrapper komponenti
 * Daxildə yeni Field komponentindən istifadə edir, React Hook Form ilə inteqrasiya olunub
 */
const FieldRendererSimple: React.FC<FieldRendererSimpleProps> = ({ 
  type,
  column, 
  disabled = false, 
  readOnly = false,
  value,
  onChange,
  id,
  name 
}) => {
  // React Hook Form kontekstini alırıq
  const formContext = useFormContext();
  
  // Əgər form konteksti yoxdursa və test rejimi varsa, test komponent qaytarırıq
  if (!formContext) {
    // Test environment üçün basit input komponenti
    if (type && id) {
      return (
        <input
          data-testid={`field-${id}`}
          type={type === 'number' ? 'number' : 'text'}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          id={id}
        />
      );
    }
    
    console.error('FieldRendererSimple: No form context found. Make sure to use this component inside a FormProvider.');
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-600 text-sm">Form konteksti tapılmadı</p>
      </div>
    );
  }
  
  // Column obyekti varsa, onu istifadə edirik
  if (column) {
    // React Hook Form adapter yaradırıq
    const adapter = new ReactHookFormAdapter(formContext);
    
    // Validasiya qaydalarını tətbiq edirik
    React.useEffect(() => {
      if (column && column.id) {
        const rules: Record<string, any> = {};
        
        if (column.is_required) {
          rules.required = `${column.name} sahəsi məcburidir`;
        }
        
        if (column.type === 'number') {
          rules.valueAsNumber = true;
        }
        
        formContext.register(column.id, rules);
      }
    }, [column, formContext]);
    
    // Vahid Field komponentini qaytarırıq
    return (
      <Field
        column={column}
        adapter={adapter}
        disabled={disabled}
        readOnly={readOnly}
      />
    );
  }

  // Əgər column yoxdursa, amma type varsa, mock column yaradırıq
  if (type && id) {
    const mockColumn: Column = {
      id: id,
      name: name || id,
      type: type,
      category_id: 'mock',
      is_required: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const adapter = new ReactHookFormAdapter(formContext);
    
    return (
      <Field
        column={mockColumn}
        adapter={adapter}
        disabled={disabled}
        readOnly={readOnly}
      />
    );
  }

  return null;
};

export default FieldRendererSimple;
