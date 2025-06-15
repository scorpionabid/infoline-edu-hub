
import React from 'react';
import { Column } from '@/types/column';
import { FormField } from '@/components/dataEntry/fields/FormField';

interface DataEntryFormProps {
  columns: Column[];
  formData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  disabled?: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  columns,
  formData,
  onChange,
  disabled = false
}) => {
  const handleFieldChange = (columnId: string, value: any) => {
    onChange({
      ...formData,
      [columnId]: value
    });
  };

  if (!columns || columns.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Bu kateqoriya üçün heç bir sahə tapılmadı
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
          onChange={(value) => handleFieldChange(column.id, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default DataEntryForm;
