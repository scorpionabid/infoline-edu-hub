
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import Field from '@/components/dataEntry/fields/Field';
import { FormAdapter } from '@/components/dataEntry/fields/adapters/FormAdapter';
import { Column } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';

export interface FormFieldsProps {
  columns: Column[];
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Form Fields komponenti - sütunlar əsasında forma sahələrini render edir
 * React Hook Form ilə inteqrasiya edir və Field komponentini istifadə edir
 */
const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  readOnly = false,
  disabled = false,
  className = ''
}) => {
  const { t } = useLanguage();
  const form = useFormContext();
  
  // Təhlükəsizlik yoxlanışı
  if (!Array.isArray(columns)) {
    console.warn('FormFields: columns is not an array:', columns);
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noColumnsAvailable')}
      </div>
    );
  }
  
  if (columns.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('noColumnsAvailable')}
      </div>
    );
  }
  
  // Form adapter yaradırıq
  const adapter = new FormAdapter(form, readOnly, disabled);
  
  // Debug məlumatları
  console.log('[FormFields] Rendering fields:', {
    columnsCount: columns.length,
    readOnly,
    disabled,
    formMethods: !!form
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {columns.map((column) => {
        if (!column || !column.id) {
          console.warn('[FormFields] Invalid column found:', column);
          return null;
        }

        return (
          <FormField
            key={column.id}
            control={form.control}
            name={column.id}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  {column.name}
                  {column.is_required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Field
                    column={column}
                    adapter={adapter}
                    disabled={disabled}
                    readOnly={readOnly}
                  />
                </FormControl>
                {column.help_text && (
                  <p className="text-xs text-muted-foreground">{column.help_text}</p>
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
