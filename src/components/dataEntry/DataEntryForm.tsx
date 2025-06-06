
import React from 'react';
import UnifiedDataEntryForm from '@/components/dataEntry/unified/UnifiedDataEntryForm';

// Legacy wrapper that forwards all props to UnifiedDataEntryForm
const DataEntryForm: React.FC<any> = (props) => {
  // Transform the props to match UnifiedDataEntryForm interface
  const transformedProps = {
    ...props,
    onSave: props.onSave ? async () => {
      const result = await props.onSave();
      return result;
    } : undefined,
    onSubmit: props.onSubmit ? async () => {
      const result = await props.onSubmit();
      return result;
    } : undefined
  };

  return <UnifiedDataEntryForm {...transformedProps} />;
};

export default DataEntryForm;
