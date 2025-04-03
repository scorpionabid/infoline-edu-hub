
import { useState, useEffect, useMemo } from 'react';
import { DataEntryForm } from '@/types/dataEntry';

export function useFormState(initialState: DataEntryForm | (() => DataEntryForm)) {
  const [formState, setFormState] = useState<DataEntryForm>(initialState);
  
  // Add computed properties
  const computedState = useMemo(() => {
    return {
      ...formState,
      // Any computed values can be added here
    };
  }, [formState]);
  
  return {
    formState: computedState,
    setFormState,
  };
}

export default useFormState;
