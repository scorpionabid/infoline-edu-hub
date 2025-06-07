
import React from 'react';
import { Column } from '@/types/column';
import UnifiedFieldRenderer from '@/components/dataEntry/fields/UnifiedFieldRenderer';

interface FormFieldsProps {
  columns: Column[];
  readOnly?: boolean;
}

const FormFields: React.FC<FormFieldsProps> = ({ columns, readOnly = false }) => {
  return (
    <div className="space-y-4">
      {columns.map((column) => (
        <UnifiedFieldRenderer
          key={column.id}
          column={column}
          value=""
          onChange={() => {}}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};

export default FormFields;
