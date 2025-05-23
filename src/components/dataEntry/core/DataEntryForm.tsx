import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { useLanguage } from '@/context/LanguageContext';
import DataEntryFormContent from './DataEntryFormContent';
import { DataEntryFormLoading, DataEntryFormError } from '../shared';
import { toast } from 'sonner';
import { safeGetByUUID } from '@/utils/dataIndexing';

// Define the component props
interface DataEntryFormProps {
  schoolId?: string;
  categoryId?: string;
  readOnly?: boolean;
  onSave?: (data: any) => Promise<boolean>;
  onCancel?: () => void;
}

// The main component with standardized UUID handling
const DataEntryForm: React.FC<DataEntryFormProps> = ({
  schoolId,
  categoryId: propCategoryId,
  readOnly = false,
  onSave,
  onCancel
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  
  // Use provided IDs or fallback to URL params, with empty string as final fallback
  const resolvedCategoryId = propCategoryId || params.categoryId || '';
  const resolvedSchoolId = schoolId || params.schoolId || '';
  
  // Setup form with safety measures
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange'
  });
  
  const { reset, formState, handleSubmit } = methods;

  // Get category data and entries - handle loading and error states properly
  const { 
    category, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useCategoryData({
    categoryId: resolvedCategoryId
  });
  
  const {
    dataEntries,
    entriesMap, // Use entriesMap directly from the hook
    isLoading: entriesLoading,
    error: entriesError,
    saveDataEntries,
    fetchDataEntries
  } = useDataEntryState({
    categoryId: resolvedCategoryId,
    schoolId: resolvedSchoolId
  });
  
  // Add defensive console logs to help with debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('DataEntryForm - IDs and state:', {
        categoryId: resolvedCategoryId, 
        schoolId: resolvedSchoolId,
        entriesMapAvailable: entriesMap ? 'yes' : 'no', 
        entriesMapKeys: entriesMap ? Object.keys(entriesMap).length : 0,
        dataEntriesCount: Array.isArray(dataEntries) ? dataEntries.length : 'not an array'
      });
    }
  }, [resolvedCategoryId, resolvedSchoolId, entriesMap, dataEntries]);
  
  // Set form values from data entries with enhanced safety
  useEffect(() => {
    try {
      // Skip if entriesMap is not valid
      if (!entriesMap || typeof entriesMap !== 'object') {
        console.warn('Cannot set form values: entriesMap is not a valid object');
        return;
      }

      // Now safely extract values with proper type checks
      const formValues: Record<string, string> = {};
      
      Object.keys(entriesMap).forEach(columnId => {
        try {
          if (!columnId || typeof columnId !== 'string') {
            console.warn('Invalid column ID in entriesMap:', columnId);
            return;
          }
          
          const entry = entriesMap[columnId];
          
          // Skip if entry is invalid
          if (!entry || typeof entry !== 'object') {
            console.warn(`Invalid entry for column ${columnId} in entriesMap:`, entry);
            return;
          }
          
          // Safe conversion to string for form value
          const entryValue = entry.value;
          const safeValue = entryValue !== undefined && entryValue !== null 
            ? String(entryValue) 
            : '';
            
          formValues[columnId] = safeValue;
          
        } catch (err) {
          console.error(`Error processing entry for column ${columnId}:`, err);
        }
      });
      
      // Only reset if we have values
      if (Object.keys(formValues).length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Setting form values:', formValues);
        }
        reset(formValues);
      } else {
        console.log('No form values to set');
      }
    } catch (error) {
      console.error('Error setting form values:', error);
      toast.error(t('errorLoadingFormData'));
    }
  }, [entriesMap, reset, t]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (resolvedCategoryId && resolvedSchoolId) {
      fetchDataEntries();
    }
  }, [fetchDataEntries, resolvedCategoryId, resolvedSchoolId]);

  // Safe function to get an entry value using our utility
  const safeGetEntryValue = (columnId: string | null | undefined): string => {
    if (!columnId) return '';
    
    const entry = safeGetByUUID(entriesMap, columnId);
    if (!entry) return '';
    
    return entry.value !== undefined && entry.value !== null ? String(entry.value) : '';
  };

  // Handle form submission with better error handling
  const onSubmit = async (data: any) => {
    try {
      if (!category || !category.columns) {
        toast.error(t('categoryOrColumnsUndefined'));
        return;
      }

      const formattedEntries = Object.entries(data).map(([columnId, value]) => {
        // Try to find existing entry for this column
        const existingEntry = safeGetByUUID(entriesMap, columnId);
        
        // Prepare the entry with all required fields
        return {
          id: existingEntry?.id || undefined, // Use undefined for new entries
          school_id: resolvedSchoolId,
          category_id: resolvedCategoryId,
          column_id: columnId,
          value: value !== undefined ? String(value) : '',
          status: existingEntry?.status || 'draft',
          created_at: existingEntry?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });

      // First try to use the onSave prop if provided
      if (typeof onSave === 'function') {
        const success = await onSave(formattedEntries);
        if (success) {
          toast.success(t('dataSavedSuccessfully'));
          return;
        }
      } else {
        // Otherwise use our internal save function
        await saveDataEntries(formattedEntries);
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`${t('errorSavingData')}: ${error.message || 'Unknown error'}`);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else {
      navigate(-1);
    }
  };
  
  // Loading states with better error handling
  const isLoading = categoryLoading || entriesLoading;
  const hasError = categoryError || entriesError;
  
  // Debug information for troubleshooting
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('DataEntryForm render state:', {
        categoryId: resolvedCategoryId,
        schoolId: resolvedSchoolId,
        isLoading,
        hasError,
        categoryAvailable: !!category,
        entriesMapSize: entriesMap ? Object.keys(entriesMap).length : 0
      });
    }
  }, [resolvedCategoryId, resolvedSchoolId, isLoading, hasError, category, entriesMap]);

  // Safe render function that won't crash on undefined
  const renderFormContent = () => {
    if (isLoading) {
      return <DataEntryFormLoading />;
    }
    
    if (hasError) {
      return (
        <DataEntryFormError 
          error={categoryError || entriesError || 'Unknown error'} 
          onRetry={fetchDataEntries}
        />
      );
    }
    
    if (!category) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          {t('categoryNotFound')}
        </div>
      );
    }
    
    return (
      <DataEntryFormContent 
        category={category} 
        readOnly={readOnly} 
      />
    );
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="w-full border shadow-sm">
          <CardHeader className="bg-card">
            <CardTitle className="text-xl font-semibold">
              {category?.name || t('dataEntry')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderFormContent()}
          </CardContent>
          
          {!readOnly && (
            <div className="p-4 bg-background flex justify-end gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!formState.isDirty || formState.isSubmitting || isLoading}
              >
                {formState.isSubmitting ? t('saving') : t('save')}
              </Button>
            </div>
          )}
        </Card>
      </form>
    </FormProvider>
  );
};

export default DataEntryForm;
