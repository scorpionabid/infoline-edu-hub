
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import FormFields from './FormFields';
import { useDataEntryState } from '@/hooks/dataEntry/useDataEntryState';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/LanguageContext';

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
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('general');
  
  // Setup form
  const methods = useForm({
    defaultValues: {},
    mode: 'onChange'
  });
  
  const { handleSubmit, formState: { isSubmitting, isDirty }, reset } = methods;

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
  
  // Group columns by section
  const sections = React.useMemo(() => {
    if (!category || !category.columns || !Array.isArray(category.columns)) {
      return { general: [] };
    }
    
    return category.columns.reduce((acc: Record<string, any[]>, column) => {
      if (!column) return acc;  // Skip null/undefined columns
      
      const section = (column.section || 'general').toString();
      if (!acc[section]) acc[section] = [];
      acc[section].push(column);
      return acc;
    }, { general: [] });
  }, [category]);
  
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
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Loading state
  if (categoryLoading || entriesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('loading')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (categoryError || entriesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('error')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            {categoryError || entriesError}
          </div>
          <Button onClick={() => navigate(-1)} className="mt-4">{t('goBack')}</Button>
        </CardContent>
      </Card>
    );
  }
  
  // If category doesn't exist
  if (!category) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notFound')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{t('categoryNotFound')}</div>
          <Button onClick={() => navigate(-1)} className="mt-4">{t('goBack')}</Button>
        </CardContent>
      </Card>
    );
  }
  
  // Check if section keys are valid strings
  const validSections = Object.entries(sections).filter(
    ([key]) => typeof key === 'string' && key.length > 0
  );
  
  // Render sections as tabs if multiple valid sections exist
  const hasSections = validSections.length > 1;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Card>
          <CardHeader>
            <CardTitle>{category.name || t('untitledCategory')}</CardTitle>
            {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
          </CardHeader>
          
          <CardContent>
            {hasSections ? (
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                  {validSections.map(([section]) => (
                    <TabsTrigger key={section} value={section}>
                      {section === 'general' ? t('generalInfo') : section}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {validSections.map(([section, columns]) => (
                  <TabsContent key={section} value={section} className="space-y-4">
                    <FormFields 
                      columns={columns || []} 
                      readOnly={readOnly} 
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="space-y-4">
                <FormFields 
                  columns={category.columns || []} 
                  readOnly={readOnly} 
                />
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              {!readOnly && (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? t('saving') : t('save')}
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
