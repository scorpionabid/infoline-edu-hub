
import React from 'react';
import { useFormContext } from 'react-hook-form';
import Field, { ReactHookFormAdapter } from './Field';
import { Column } from '@/types/column';

// İnterfeysləri saxlayırıq ki, geriyə uyğunluq olsun
export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'date' | 'time';

interface FieldProps {
  column: Column;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * FieldRendererSimple - geriyə uyğunluq üçün wrapper komponenti
 * Daxildə yeni Field komponentindən istifadə edir, React Hook Form ilə inteqrasiya olunub
 */
const FieldRendererSimple: React.FC<FieldProps> = ({ column, disabled = false, readOnly = false }) => {
  // React Hook Form kontekstini alırıq
  const formContext = useFormContext();
  
  // Əgər form konteksti yoxdursa, xəta qaytar
  if (!formContext) {
    console.error('FieldRendererSimple: No form context found. Make sure to use this component inside a FormProvider.');
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-600 text-sm">Form konteksti tapılmadı</p>
      </div>
    );
  }
  
  // React Hook Form adapter yaradırıq
  const adapter = new ReactHookFormAdapter(formContext);
  
  // Validasiya qaydalarını tətbiq edirik (əvvəllər register metodu ilə edilirdi)
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
};

export default FieldRendererSimple;
