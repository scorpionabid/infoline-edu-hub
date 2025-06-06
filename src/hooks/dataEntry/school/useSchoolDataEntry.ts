
import { useState, useCallback } from 'react';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryStatus } from '@/types/dataEntry';

export interface UseSchoolDataEntryOptions {
  schoolId: string;
  categoryId: string;
  autoSave?: boolean;
}

export interface UseSchoolDataEntryResult {
  formData: Record<string, any>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  entryStatus: DataEntryStatus;
  handleFieldChange: (fieldId: string, value: any) => void;
  handleSave: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export const useSchoolDataEntry = ({
  schoolId,
  categoryId,
  autoSave = false
}: UseSchoolDataEntryOptions): UseSchoolDataEntryResult => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus>(DataEntryStatus.DRAFT);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      console.log('Saving school data:', { schoolId, categoryId, formData });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [schoolId, categoryId, formData]);

  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    try {
      console.log('Submitting school data:', { schoolId, categoryId, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEntryStatus(DataEntryStatus.PENDING);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }, [schoolId, categoryId, formData]);

  return {
    formData,
    isLoading,
    isSaving,
    error,
    entryStatus,
    handleFieldChange,
    handleSave,
    handleSubmit
  };
};

export default useSchoolDataEntry;
