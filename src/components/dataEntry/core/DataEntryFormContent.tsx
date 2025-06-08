
import React from 'react';
import { Column } from '@/types/column';
import FormFields from './FormFields';

interface DataEntryFormContentProps {
  columns: Column[];
  category?: any;
  readOnly?: boolean;
}

const DataEntryFormContent: React.FC<DataEntryFormContentProps> = ({
  columns,
  category,
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
