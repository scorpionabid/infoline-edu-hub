
import React, { useState, useEffect } from 'react';
import { Column } from '@/types/column';
import { FormField } from './FormField';

interface FormFieldsEntryProps {
  columns: Column[];
  initialEntries?: any[];
  onSave?: (entries: any[]) => Promise<void>;
  loading?: boolean;
  categoryId?: string;
}

const FormFieldsEntry: React.FC<FormFieldsEntryProps> = ({ 
  columns, 
  initialEntries = [], 
  onSave, 
  loading = false,
  categoryId
}) => {
  const [entries, setEntries] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // İlkin dəyərləri doldururuq
    if (initialEntries && initialEntries.length > 0) {
      const initialValues: Record<string, any> = {};
      initialEntries.forEach((entry) => {
        initialValues[entry.column_id] = entry.value;
      });
      setEntries(initialValues);
    }
  }, [initialEntries]);

  const handleChange = (columnId: string, value: any) => {
    setEntries((prev) => ({
      ...prev,
      [columnId]: value
    }));
    
    // Xətaları təmizləyirik
    if (errors[columnId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[columnId];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach((column) => {
      if (column.is_required && (!entries[column.id] || entries[column.id].trim() === '')) {
        newErrors[column.id] = 'Bu sahə məcburidir';
      }
      
      // Burada əlavə validasiyalar əlavə edilə bilər
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!onSave) return;
    
    if (validate()) {
      const dataToSave = Object.keys(entries).map((columnId) => ({
        column_id: columnId,
        value: entries[columnId],
        category_id: categoryId
      }));
      
      await onSave(dataToSave);
    }
  };

  return (
    <div className="space-y-4">
      {columns.map((column) => (
        <FormField
          key={column.id}
          column={column}
          value={entries[column.id] || ''}
          onChange={handleChange}
          error={errors[column.id]}
        />
      ))}
      
      {onSave && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saxlanılır...' : 'Saxla'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FormFieldsEntry;
