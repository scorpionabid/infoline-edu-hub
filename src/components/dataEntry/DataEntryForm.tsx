
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
import DataEntryFormLoading from './DataEntryFormLoading';
import DataEntryFormError from './DataEntryFormError';
import { toast } from 'sonner';

// Define the component props
interface DataEntryFormProps {
  schoolId?: string;
  categoryId?: string;
  readOnly?: boolean;
  onSave?: (data: any) => Promise<boolean>;
  onCancel?: () => void;
}

// The main component
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
  
  const { reset, formState } = methods;

  // Get category data and entries - handle loading and error states properly
  const { 
    category, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useCategoryData({
    categoryId: resolvedCategoryId
  });
  
  const {
    dataEntries: rawDataEntries,
    entriesLookup,  // Get the lookup object from the hook
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
        entriesLookupAvailable: entriesLookup ? 'yes' : 'no', 
        entriesLookupKeys: entriesLookup ? Object.keys(entriesLookup).length : 0,
        rawDataEntriesCount: Array.isArray(rawDataEntries) ? rawDataEntries.length : 'not an array'
      });
    }
  }, [resolvedCategoryId, resolvedSchoolId, entriesLookup, rawDataEntries]);
  
  // Ensure we always have a valid entriesMap object, even if entriesLookup is undefined
  const entriesMap = React.useMemo(() => {
    try {
      // Ensure we always return a valid object
      if (!entriesLookup || typeof entriesLookup !== 'object') {
        console.warn('entriesLookup is invalid, creating empty map:', entriesLookup);
        return {} as Record<string, any>;
      }
      
      // Check if it's a proper Record object with keys
      if (Object.keys(entriesLookup).length === 0) {
        console.log('entriesLookup is empty, but valid object');
      } else {
        console.log(`entriesLookup has ${Object.keys(entriesLookup).length} entries`);
      }
      
      return entriesLookup;
    } catch (error) {
      console.error('Error processing entriesLookup:', error);
      return {} as Record<string, any>; // Return empty object on error
    }
  }, [entriesLookup]);
  
  // Set form values from data entries with enhanced safety
  useEffect(() => {
    try {
      // First check if we have any entriesMap 
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
        console.log('No form values to set - using empty object');
        reset({});
      }
    } catch (error) {
      console.error('Error setting form values:', error);
      toast.error(t('errorLoadingFormData'));
      
      // Reset to empty state on error
      reset({});
    }
  }, [entriesMap, reset, t]);
  
  // Handle save with proper error checking
  const onSubmitForm = async (data: any) => {
    try {
      // Safety check for data
      if (!data || typeof data !== 'object') {
        toast.error(t('invalidFormData'));
        return;
      }

      // Use custom save handler if provided
      if (typeof onSave === 'function') {
        const result = await onSave(data);
        if (result) {
          toast.success(t('dataSaved'));
          if (typeof onCancel === 'function') onCancel();
        }
        return;
      }

      // Use default save handler
      if (!resolvedCategoryId || !resolvedSchoolId) {
        toast.error(t('missingRequiredIds'));
        return;
      }
      
      // Convert form data to data entry format with safety checks
      const formattedData = Object.entries(data).map(([columnId, value]) => ({
        column_id: columnId,
        value: value !== undefined ? value : '',
        category_id: resolvedCategoryId,
        school_id: resolvedSchoolId,
      }));
      
      // Only proceed if we have data to save
      if (formattedData.length === 0) {
        toast.warning(t('noDataToSave'));
        return;
      }
      
      const result = await saveDataEntries(formattedData);
      if (result) {
        toast.success(t('dataSaved'));
        navigate(-1);
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(t('errorSavingData'));
    }
  };
  
  // Handle cancel
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
        categoryLoaded: !!category,
        entriesCount: Array.isArray(rawDataEntries) ? rawDataEntries.length : 'not an array',
        entriesMapKeys: entriesMap ? Object.keys(entriesMap).length : 0,
        columns: category?.columns?.length || 0
      });
    }
  }, [resolvedCategoryId, resolvedSchoolId, isLoading, hasError, category, rawDataEntries, entriesMap]);

  // Safe render function that won't crash on undefined
  const renderFormContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{t('loadingFormData')}</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (hasError) {
      return (
        <div className="py-8 text-center">
          <div className="text-destructive mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-destructive font-medium">{t('errorLoadingForm')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('pleaseTryAgainLater')}</p>
          <Button onClick={() => fetchDataEntries()} variant="outline" className="mt-4">
            {t('tryAgain')}
          </Button>
        </div>
      );
    }

    // Validate category object
    if (!category || typeof category !== 'object') {
      console.warn('Invalid category object:', category);
      return (
        <div className="py-8 text-center">
          <p className="text-destructive font-medium">{t('categoryLoadError')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('pleaseTryAgainLater')}</p>
        </div>
      );
    }

    // Render form fields with safe columns
    return (
      <DataEntryFormContent 
        category={category} 
        readOnly={readOnly} 
      />
    );
  };

  // Wrap the entire component in a try-catch for additional safety
  try {
    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmitForm)} className="w-full space-y-4">
          <Card className="w-full shadow-md">
            <CardHeader>
              <CardTitle>
                {category?.name || t('categoryForm')}
              </CardTitle>
              {category?.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
            </CardHeader>
            <CardContent>
              {renderFormContent()}
              
              {!isLoading && !hasError && category?.columns?.length > 0 && (
                <div className="flex justify-end space-x-2 mt-6">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    {t('cancel')}
                  </Button>
                  {!readOnly && (
                    <Button 
                      type="submit" 
                      disabled={formState.isSubmitting || !formState.isDirty}
                    >
                      {formState.isSubmitting ? t('saving') : t('save')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    );
  } catch (error) {
    console.error('Fatal error rendering DataEntryForm:', error);
    return (
      <div className="p-6 border border-red-300 rounded bg-red-50 text-red-800 max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-bold mb-4">{t('criticalError')}</h2>
        <p className="mb-4">{t('unexpectedErrorOccurred')}</p>
        <div className="bg-white p-3 rounded text-xs font-mono overflow-auto max-h-32 mb-4">
          {error instanceof Error ? error.message : String(error)}
        </div>
        <Button onClick={() => window.location.reload()} variant="destructive">
          {t('refreshPage')}
        </Button>
      </div>
    );
  }
};

export default DataEntryForm;
