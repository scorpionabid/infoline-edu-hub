
import React from 'react';
import { Column } from '@/types/column';
import FormFields from './FormFields';

interface DataEntryFormContentProps {
  columns: Column[];
  readOnly?: boolean;
}

const DataEntryFormContent: React.FC<DataEntryFormContentProps> = ({
  columns,
  readOnly = false
}) => {
  return (
    <div className="space-y-6">
      <FormFields
        columns={columns}
        readOnly={readOnly}
      />
    </div>
  );
};

export default DataEntryFormContent;
