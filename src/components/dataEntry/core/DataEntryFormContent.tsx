
import React from 'react';
import { Column } from '@/types/column';
import FormFields from './FormFields';

interface DataEntryFormContentProps {
  columns: Column[];
  formData: Record<string, any>;
  onChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
}

const DataEntryFormContent: React.FC<DataEntryFormContentProps> = ({
  columns,
  formData,
  onChange,
  readOnly = false
}) => {
  return (
    <FormFields
      columns={columns}
      formData={formData}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};

export default DataEntryFormContent;
