
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormFields from '@/components/dataEntry/core/FormFields';
import ProgressTracker from '@/components/dataEntry/core/ProgressTracker';
import AutoSaveIndicator from '@/components/dataEntry/core/AutoSaveIndicator';
import ValidationSummary from '@/components/dataEntry/core/ValidationSummary';
import { useAutoSave } from '@/hooks/dataEntry/useAutoSave';
import { useRealTimeValidation } from '@/hooks/dataEntry/useRealTimeValidation';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { Save, Send, FileText } from 'lucide-react';

export interface EnhancedDataEntryFormProps {
  categoryId: string;
  schoolId: string;
  columns: Column[];
  initialData?: Record<string, any>;
  readOnly?: boolean;
  onSave?: (data: Record<string, any>) => Promise<void>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  className?: string;
}

/**
 * Enhanced Data Entry Form - tam funksionallı məlumat daxil etmə forması
 * Auto-save, real-time validation və progress tracking ilə
 */
const EnhancedDataEntryForm: React.FC<EnhancedDataEntryFormProps> = ({
  categoryId,
  schoolId,
  columns,
  initialData = {},
  readOnly = false,
  onSave,
  onSubmit,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataModified, setIsDataModified] = useState(false);
  
  // Dinamik schema yaradırıq
  const schema = React.useMemo(() => {
    const schemaObject: Record<string, z.ZodTypeAny> = {};
    
    columns.forEach(column => {
      let fieldSchema: z.ZodTypeAny = z.string().optional();
      
      // Tələb olunan sahələr
      if (column.is_required) {
        fieldSchema = z.string().min(1, t('fieldRequired', { field: column.name }));
      }
      
      // Tip əsaslı validasiya
      switch (column.type) {
        case 'number':
          fieldSchema = column.is_required 
            ? z.number({ required_error: t('fieldRequired', { field: column.name }) })
            : z.number().optional();
          break;
        case 'email':
          fieldSchema = column.is_required
            ? z.string().email(t('fieldInvalidEmail', { field: column.name })).min(1, t('fieldRequired', { field: column.name }))
            : z.string().email(t('fieldInvalidEmail', { field: column.name })).optional().or(z.literal(''));
          break;
      }
      
      schemaObject[column.id] = fieldSchema;
    });
    
    return z.object(schemaObject);
  }, [columns, t]);
  
  // Form yaradırıq
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: 'onChange'
  });
  
  // Form məlumatlarını izləyirik
  const formData = form.watch();
  
  // Dəyişiklikləri izləyirik
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        setIsDataModified(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Real-time validation
  const {
    errors,
    warnings,
    isValid,
    hasAllRequiredFields
  } = useRealTimeValidation({
    columns,
    formData,
    enabled: !readOnly
  });
  
  // Auto-save
  const {
    saveNow,
    getLastSaveTime,
    isSaving,
    autoSaveEnabled
  } = useAutoSave({
    categoryId,
    schoolId,
    formData,
    isDataModified,
    enabled: !readOnly && !!onSave
  });
  
  // Completion percentage hesablanır
  const completionPercentage = React.useMemo(() => {
    if (columns.length === 0) return 0;
    
    const filledFields = columns.filter(column => {
      const value = formData[column.id];
      return value && String(value).trim() !== '';
    }).length;
    
    return Math.round((filledFields / columns.length) * 100);
  }, [columns, formData]);
  
  // Manual save handler
  const handleSave = async () => {
    if (onSave && !isSaving) {
      try {
        await onSave(formData);
        setIsDataModified(false);
      } catch (error) {
        console.error('Save failed:', error);
      }
    }
  };
  
  // Submit handler
  const handleSubmit = async (data: Record<string, any>) => {
    if (!onSubmit || readOnly) return;
    
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      setIsDataModified(false);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sütunları bölmələr üzrə qrupları
  const sections = React.useMemo(() => {
    const sectionMap: Record<string, Column[]> = { general: [] };
    
    columns.forEach(column => {
      const section = column.section && column.section.trim() !== '' 
        ? column.section.toLowerCase() 
        : 'general';
      
      if (!sectionMap[section]) {
        sectionMap[section] = [];
      }
      
      sectionMap[section].push(column);
    });
    
    return sectionMap;
  }, [columns]);
  
  const sectionNames = Object.keys(sections);

  return (
    <FormProvider {...form}>
      <div className={`space-y-6 ${className}`}>
        {/* Header - Progress və Auto-save */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <ProgressTracker
            columns={columns}
            formData={formData}
            completionPercentage={completionPercentage}
            hasAllRequiredFields={hasAllRequiredFields}
            isValid={isValid}
            className="flex-1"
          />
          
          {!readOnly && (
            <AutoSaveIndicator
              isSaving={isSaving}
              autoSaveEnabled={autoSaveEnabled}
              lastSaveTime={getLastSaveTime()}
              onManualSave={handleSave}
            />
          )}
        </div>
        
        {/* Validation Summary */}
        {(!isValid || warnings.length > 0) && (
          <ValidationSummary
            errors={errors}
            warnings={warnings}
            isValid={isValid}
          />
        )}
        
        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('dataEntryForm')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {sectionNames.length === 1 ? (
                // Bir bölmə varsa, sadə layout
                <FormFields 
                  columns={sections[sectionNames[0]]} 
                  readOnly={readOnly}
                />
              ) : (
                // Çoxlu bölmə varsa, tabs layout
                <Tabs defaultValue={sectionNames[0]}>
                  <TabsList className="grid w-full grid-cols-auto gap-2">
                    {sectionNames.map(section => (
                      <TabsTrigger key={section} value={section}>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {sectionNames.map(section => (
                    <TabsContent key={section} value={section} className="mt-6">
                      <FormFields 
                        columns={sections[section]} 
                        readOnly={readOnly}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              
              {/* Action Buttons */}
              {!readOnly && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {t('completionStatus')}: {completionPercentage}%
                    </div>
                    
                    <div className="flex gap-3">
                      {onSave && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSave}
                          disabled={isSaving || !isDataModified}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {t('save')}
                        </Button>
                      )}
                      
                      {onSubmit && (
                        <Button
                          type="submit"
                          disabled={isSubmitting || !hasAllRequiredFields || !isValid}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSubmitting ? t('submitting') : t('submit')}
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
};

export default EnhancedDataEntryForm;
