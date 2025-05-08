
import { useState, useEffect } from 'react';
import { DataEntryForm, initializeForm } from '../form';

export function useFormInitialization(categoryId: string, initialData: any[] = []) {
  const [form, setForm] = useState<DataEntryForm>(() => 
    initializeForm(categoryId, initialData)
  );
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // This would normally fetch data from an API
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setForm({
          categoryId,
          entries: initialData.reduce((acc, item) => {
            acc[item.columnId] = item.value;
            return acc;
          }, {}),
          status: 'draft',
          isModified: false
        });
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId, initialData]);
  
  return {
    form,
    isLoading,
    setForm
  };
}

export default useFormInitialization;
