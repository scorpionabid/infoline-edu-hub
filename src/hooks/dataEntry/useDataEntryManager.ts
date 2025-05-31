
import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { DataEntryForm, DataEntryStatus } from '@/types/dataEntry';
import { saveDataEntryForm, submitForApproval, getDataEntries } from '@/services/dataEntryService';
import { useDataEntryRealTime } from '@/hooks/realtime/useRealTimeUpdates';

interface UseDataEntryManagerOptions {
  categoryId: string;
  schoolId: string;
  category: CategoryWithColumns | null;
}

export const useDataEntryManager = ({ categoryId, schoolId, category }: UseDataEntryManagerOptions) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [entryStatus, setEntryStatus] = useState<DataEntryStatus>('draft');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real-time updates
  useDataEntryRealTime(schoolId, (data) => {
    console.log('Real-time data entry update:', data);
    // Reload data if it's for this category
    if (data.new?.category_id === categoryId) {
      loadData();
    }
  });

  // Load existing data
  const loadData = useCallback(async () => {
    if (!categoryId || !schoolId) return;
    
    setIsLoading(true);
    try {
      const result = await getDataEntries(schoolId, categoryId);
      if (result.success && result.data) {
        const dataMap: Record<string, any> = {};
        result.data.forEach(entry => {
          dataMap[entry.columnId] = entry.value;
        });
        setFormData(dataMap);
        setHasUnsavedChanges(false);
        
        // Set status based on entries
        if (result.data.length > 0) {
          setEntryStatus(result.data[0].status);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: t('error'),
        description: t('errorLoadingData'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, schoolId, t, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle form data changes
  const handleFormDataChange = useCallback((newData: Record<string, any>) => {
    setFormData(newData);
    setErrors({}); // Clear errors when data changes
    setHasUnsavedChanges(true);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      if (entryStatus === 'draft') {
        handleSave();
      }
    }, 30000); // Auto-save after 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, hasUnsavedChanges, entryStatus]);

  // Save as draft
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setErrors({});
    
    try {
      const entries = Object.entries(formData).map(([columnId, value]) => ({
        columnId,
        value: String(value || ''),
        status: 'draft' as DataEntryStatus
      }));

      const formDataToSave: DataEntryForm = {
        schoolId,
        categoryId,
        entries
      };

      const result = await saveDataEntryForm(formDataToSave);
      
      if (result.success) {
        setEntryStatus('draft');
        setLastSaved(new Date().toISOString());
        setHasUnsavedChanges(false);
        toast({
          title: t('success'),
          description: t('dataSavedSuccessfully'),
        });
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast({
        title: t('error'),
        description: t('errorSavingData'),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [formData, schoolId, categoryId, t, toast]);

  // Submit for approval
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate required fields - safely check if category and columns exist
      const validationErrors: Record<string, string> = {};
      if (category?.columns) {
        category.columns.forEach(column => {
          if (column.is_required && (!formData[column.id] || formData[column.id].toString().trim() === '')) {
            validationErrors[column.id] = t('fieldRequired');
          }
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast({
          title: t('validationError'),
          description: t('pleaseCompleteAllRequiredFields'),
          variant: 'destructive'
        });
        return;
      }

      const entries = Object.entries(formData).map(([columnId, value]) => ({
        columnId,
        value: String(value || ''),
        status: 'pending' as DataEntryStatus
      }));

      const formDataToSubmit: DataEntryForm = {
        schoolId,
        categoryId,
        entries
      };

      const result = await submitForApproval(formDataToSubmit);
      
      if (result.success) {
        setEntryStatus('pending');
        setHasUnsavedChanges(false);
        toast({
          title: t('success'),
          description: t('dataSubmittedForApproval'),
        });
      } else {
        throw new Error(result.error || 'Submit failed');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({
        title: t('error'),
        description: t('errorSubmittingData'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, category, schoolId, categoryId, t, toast]);

  // Excel import handler
  const handleImportData = useCallback(async (data: Record<string, any>) => {
    try {
      setFormData(prevData => ({ ...prevData, ...data }));
      setHasUnsavedChanges(true);
      
      // Auto-save imported data
      await handleSave();
      
      toast({
        title: t('success'),
        description: t('dataImportedAndSaved'),
      });
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: t('error'),
        description: t('errorImportingData'),
        variant: 'destructive'
      });
    }
  }, [handleSave, t, toast]);

  // Excel export template handler
  const handleExportTemplate = useCallback(() => {
    // This will be implemented with the Excel integration
    console.log('Export template for category:', categoryId);
  }, [categoryId]);

  return {
    formData,
    setFormData: handleFormDataChange,
    isLoading,
    isSaving,
    isSubmitting,
    errors,
    entryStatus,
    lastSaved,
    hasUnsavedChanges,
    handleSave,
    handleSubmit,
    handleImportData,
    handleExportTemplate,
    refreshData: loadData
  };
};
