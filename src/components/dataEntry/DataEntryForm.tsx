
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
  const resolvedCategoryId = propCategoryId || params.categoryId || '';
  const resolvedSchoolId = schoolId || params.schoolId || '';
  
  // Setup form
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange'
  });
  
  const { reset } = methods;

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
    isLoading: entriesLoading,
    error: entriesError,
    saveDataEntries,
    fetchDataEntries
  } = useDataEntryState({
    categoryId: resolvedCategoryId,
    schoolId: resolvedSchoolId
  });
  
  // Set form values from data entries
  useEffect(() => {
    if (dataEntries && Array.isArray(dataEntries) && dataEntries.length > 0) {
      const values = dataEntries.reduce((acc, entry) => {
        if (entry && entry.column_id) {
          acc[entry.column_id] = entry.value || '';
        }
        return acc;
      }, {} as Record<string, string>);
      
      reset(values);
    }
  }, [dataEntries, reset]);
  
  // Handle save
  const onSubmitForm = async (data: any) => {
    try {
      if (onSave) {
        // Use custom save handler
        const result = await onSave(data);
        if (result) {
          toast.success(t('dataSaved'));
          if (onCancel) onCancel();
        }
      } else {
        // Use default save handler
        // Make sure we have valid category and school IDs
        if (!resolvedCategoryId || !resolvedSchoolId) {
          toast.error(t('missingRequiredIds'));
          return;
        }
        
        // Convert form data to data entry format
        const formattedData = Object.keys(data).map(columnId => ({
          column_id: columnId,
          value: data[columnId],
          category_id: resolvedCategoryId,
          school_id: resolvedSchoolId,
        }));
        
        const result = await saveDataEntries(formattedData);
        if (result) {
          toast.success(t('dataSaved'));
          navigate(-1);
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error(t('errorSavingData'));
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };
  
  // Loading state
  if (categoryLoading || entriesLoading) {
    return <DataEntryFormLoading />;
  }
  
  // Error state
  if (categoryError || entriesError) {
    return <DataEntryFormError error={categoryError || entriesError} onBack={() => navigate(-1)} />;
  }
  
  // If category doesn't exist
  if (!category) {
    return <DataEntryFormError error={t('categoryNotFound')} onBack={() => navigate(-1)} />;
  }
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmitForm)}>
        <Card>
          <CardHeader>
            <CardTitle>{category.name || t('untitledCategory')}</CardTitle>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </CardHeader>
          
          <CardContent>
            <DataEntryFormContent 
              category={category} 
              readOnly={readOnly} 
            />
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              {!readOnly && (
                <Button 
                  type="submit" 
                  disabled={methods.formState.isSubmitting || !methods.formState.isDirty}
                >
                  {methods.formState.isSubmitting ? t('saving') : t('save')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
};

export default DataEntryForm;
