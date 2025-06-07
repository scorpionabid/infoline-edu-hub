
import React from 'react';
import { Column } from '@/types/column';
import UnifiedFieldRenderer from '@/components/dataEntry/fields/UnifiedFieldRenderer';

interface FormFieldsProps {
  columns: Column[];
  formData?: Record<string, any>;
  onChange?: (columnId: string, value: any) => void;
  readOnly?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({ 
  columns, 
  formData = {}, 
  onChange, 
  readOnly = false 
}) => {
  const handleFieldChange = (columnId: string, value: any) => {
    if (onChange && !readOnly) {
      onChange(columnId, value);
    }
  };

  return (
    <div className="space-y-4">
      {columns.map((column) => (
        <UnifiedFieldRenderer
          key={column.id}
          column={column}
          value={formData[column.id] || ''}
          onChange={(value) => handleFieldChange(column.id, value)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default FormFields;
