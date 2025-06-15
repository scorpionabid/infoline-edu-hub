
import React from 'react';
import { Column } from '@/types/column';
import FormField from '../fields/FormField';

interface FormFieldsProps {
  columns: Column[];
  formData: Record<string, any>;
  onChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({
  columns,
  formData,
  onChange,
  readOnly = false
}) => {
  if (!columns || columns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Bu kateqoriya üçün heç bir sahə tapılmadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {columns.map((column) => (
        <FormField
          key={column.id}
          column={column}
          value={formData[column.id] || ''}
          onChange={(value) => onChange(column.id, value)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default FormFields;
