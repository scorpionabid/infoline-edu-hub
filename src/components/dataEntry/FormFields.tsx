
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CategoryWithColumns } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import TextInput from './inputs/TextInput';
import NumberInput from './inputs/NumberInput';
import SelectInput from './inputs/SelectInput';
import DateInput from './inputs/DateInput';
import CheckboxInput from './inputs/CheckboxInput';
import { Form } from '@/components/ui/form';

interface FormFieldsProps {
  category: CategoryWithColumns;
  entries: DataEntry[] | undefined;
  onChange: (entries: DataEntry[]) => void;
  disabled?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  category,
  entries = [], // Default value as empty array
  onChange,
  disabled = false
}) => {
  // Ensure entries is always an array
  const safeEntries = Array.isArray(entries) ? entries : [];
  
  // Formun başlanğıc dəyərlərini hazırlayaq
  const initialValues = React.useMemo(() => {
    const values: Record<string, any> = { fields: {} };
    
    if (category && category.columns && Array.isArray(category.columns)) {
      category.columns.forEach(column => {
        // Mövcud qeydi tapaq
        const entry = safeEntries.find(e => e.column_id === column.id);
        if (entry) {
          values.fields[column.id] = entry.value;
        } else {
          // Default dəyər
          values.fields[column.id] = column.default_value || '';
        }
      });
    }
    
    return values;
  }, [category, safeEntries]);

  // Dinamik validasiya sxemi yaradaq
  const schema = React.useMemo(() => {
    const fieldsSchema: Record<string, any> = {};
    
    if (category && category.columns && Array.isArray(category.columns)) {
      category.columns.forEach(column => {
        let fieldSchema: any;
        
        if (column.is_required) {
          if (column.type === 'text' || column.type === 'textarea') {
            fieldSchema = z.string().min(1, { message: 'Bu sahə məcburidir' });
          } else if (column.type === 'number') {
            fieldSchema = z.number().or(z.string().min(1, { message: 'Bu sahə məcburidir' }));
          } else if (column.type === 'select') {
            fieldSchema = z.string().min(1, { message: 'Bu sahə məcburidir' });
          } else if (column.type === 'checkbox') {
            fieldSchema = z.array(z.string()).min(1, { message: 'Bu sahə məcburidir' });
          } else if (column.type === 'date') {
            fieldSchema = z.string().min(1, { message: 'Bu sahə məcburidir' });
          } else {
            fieldSchema = z.any();
          }
        } else {
          // Məcburi olmayan sahələr üçün tipləri müəyyən edək
          if (column.type === 'number') {
            fieldSchema = z.number().optional().or(z.string().optional());
          } else if (column.type === 'checkbox') {
            fieldSchema = z.array(z.string()).optional();
          } else if (column.type === 'text' || column.type === 'textarea') {
            fieldSchema = z.string().optional();
          } else if (column.type === 'select') {
            fieldSchema = z.string().optional();
          } else if (column.type === 'date') {
            fieldSchema = z.string().optional();
          } else {
            fieldSchema = z.any().optional();
          }
        }
        
        fieldsSchema[column.id] = fieldSchema;
      });
    }
    
    return z.object({ fields: z.object(fieldsSchema) });
  }, [category]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: 'onChange'
  });

  // Form dəyərləri dəyişdikdə işləyən funksiya
  const handleFormChange = React.useCallback((values: any) => {
    if (!values.fields) return;
    
    const updatedEntries: DataEntry[] = [];
    
    // Bütün sütunlar üçün
    if (category && category.columns && Array.isArray(category.columns)) {
      Object.entries(values.fields).forEach(([columnId, value]) => {
        const column = category.columns.find(c => c.id === columnId);
        if (!column) return;
        
        // Mövcud qeydi tapaq
        const existingEntry = safeEntries.find(e => e.column_id === columnId);
        
        updatedEntries.push({
          id: existingEntry?.id,
          column_id: columnId,
          category_id: category.id,
          school_id: existingEntry?.school_id || '',
          value: value as string,
          status: existingEntry?.status || 'pending'
        });
      });
    }
    
    onChange(updatedEntries);
  }, [category, safeEntries, onChange]);

  // Form dəyərləri dəyişdikdə handleFormChange funksiyasını çağıraq
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      handleFormChange(values);
    });
    
    return () => subscription.unsubscribe();
  }, [form, handleFormChange]);

  // Sütun tipinə görə müvafiq input komponentini qaytarır
  const renderFieldByType = (column: any) => {
    switch(column.type) {
      case 'text':
      case 'textarea':
        return <TextInput column={column} form={form} disabled={disabled} />;
      case 'number':
        return <NumberInput column={column} form={form} disabled={disabled} />;
      case 'select':
        return <SelectInput column={column} form={form} disabled={disabled} />;
      case 'date':
        return <DateInput column={column} form={form} disabled={disabled} />;
      case 'checkbox':
        return <CheckboxInput column={column} form={form} disabled={disabled} />;
      default:
        return <TextInput column={column} form={form} disabled={disabled} />;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {category && category.columns && Array.isArray(category.columns) ? (
            category.columns.map((column: any) => (
              <div key={column.id}>
                {renderFieldByType(column)}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-4">
              Sütun məlumatları yüklənir və ya mövcud deyil
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default FormFields;
