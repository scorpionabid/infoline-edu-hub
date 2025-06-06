
import React from 'react';
import UnifiedDataEntryForm from '@/components/dataEntry/unified/UnifiedDataEntryForm';

// Legacy wrapper that forwards all props to UnifiedDataEntryForm
const DataEntryForm: React.FC<any> = (props) => {
  return <UnifiedDataEntryForm {...props} />;
};

export default DataEntryForm;
