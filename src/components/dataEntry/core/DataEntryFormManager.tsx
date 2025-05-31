import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Save, Send, Download, Upload, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import FormFields from './FormFields';
import DataEntryFormContent from './DataEntryFormContent';

interface DataEntryFormManagerProps {
  category: CategoryWithColumns;
  schoolId: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onSave: () => Promise<void>;
  onSubmit: () => Promise<void>;
  onExportTemplate: () => void;
  onImportData: (file: File) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
  readOnly?: boolean;
}

const DataEntryFormManager: React.FC<DataEntryFormManagerProps> = ({
  category,
  schoolId,
  formData,
  onFormDataChange,
  onSave,
  onSubmit,
  onExportTemplate,
  onImportData,
  onRefresh,
  isLoading = false,
  isSaving = false,
  isSubmitting = false,
  errors = {},
  readOnly = false
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate completion percentage
  useEffect(() => {
    if (!category.columns || category.columns.length === 0) {
      setCompletionPercentage(0);
      return;
    }

    const requiredFields = category.columns.filter(col => col.is_required);
    const totalFields = Math.max(requiredFields.length, category.columns.length);
    
    const completedFields = category.columns.filter(col => {
      const value = formData[col.id];
      if (col.is_required) {
        return value !== undefined && value !== null && value !== '';
      }
      return value !== undefined && value !== null && value !== '';
    }).length;

    const percentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    setCompletionPercentage(Math.min(100, percentage));
  }, [category.columns, formData]);

  // Handle form data changes
  const handleFormDataChange = useCallback((newData: Record<string, any>) => {
    onFormDataChange(newData);
    setHasUnsavedChanges(true);
  }, [onFormDataChange]);

  // Handle save with status update
  const handleSave = useCallback(async () => {
    try {
      await onSave();
      setLastSaved(new Date().toISOString());
      setHasUnsavedChanges(false);
      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorSavingData'),
        variant: 'destructive'
      });
    }
  }, [onSave, t, toast]);

  // Handle submit for approval
  const handleSubmit = useCallback(async () => {
    if (completionPercentage < 100) {
      toast({
        title: t('warning'),
        description: t('pleaseCompleteAllRequiredFields'),
        variant: 'destructive'
      });
      return;
    }

    try {
      await onSubmit();
      toast({
        title: t('success'),
        description: t('dataSubmittedForApproval'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorSubmittingData'),
        variant: 'destructive'
      });
    }
  }, [completionPercentage, onSubmit, t, toast]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      try {
        await onRefresh();
        toast({
          title: t('success'),
          description: t('dataRefreshedSuccessfully'),
        });
      } catch (error) {
        toast({
          title: t('error'),
          description: t('errorRefreshingData'),
          variant: 'destructive'
        });
      }
    }
  }, [onRefresh, t, toast]);

  // Handle file import
  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: t('error'),
        description: t('pleaseUploadExcelFile'),
        variant: 'destructive'
      });
      return;
    }

    try {
      await onImportData(file);
      toast({
        title: t('success'),
        description: t('dataImportedSuccessfully'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorImportingData'),
        variant: 'destructive'
      });
    }

    // Reset file input
    event.target.value = '';
  }, [onImportData, t, toast]);

  // Debug məlumatı
  console.group('DataEntryFormManager Debug');
  console.log('Category:', category);
  console.log('School ID:', schoolId);
  console.log('Form data:', formData);
  console.log('Loading states:', { isLoading, isSaving, isSubmitting });
  console.groupEnd();
  
  // Kateqoriya mövcud olmadıqda və ya yüklənmə prosesində olduqda
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mb-2 mx-auto text-primary" />
          <p>{t('loadingFormData')}</p>
        </div>
      </div>
    );
  }

  // Kateqoriya yoxdursa və ya columns xüsusiyyəti yoxdursa xəbərdarlıq göstər
  if (!category || !category.id || !category.columns || category.columns.length === 0) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">{t('formDataIssue')}</h3>
            <p className="text-sm text-yellow-700 mt-1">
              {!category ? t('categoryNotFound') : 
               !category.id ? t('invalidCategoryId') : 
               !category.columns ? t('noColumnsFound') : 
               t('noColumnsInCategory')}
            </p>
            <pre className="mt-2 p-2 bg-yellow-100 rounded text-xs overflow-auto max-h-24">
              {JSON.stringify({categoryId: category?.id, columnsCount: category?.columns?.length || 0}, null, 2)}
            </pre>
            {onRefresh && (
              <Button size="sm" variant="outline" onClick={handleRefresh} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-1" />
                {t('refreshData')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with status and actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {category.name}
                <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
                  {completionPercentage === 100 ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('completed')}
                    </>
                  ) : (
                    `${Math.round(completionPercentage)}% ${t('completed')}`
                  )}
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportTemplate}
                disabled={isLoading || isSaving || isSubmitting}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('downloadTemplate')}
              </Button>
              
              {onRefresh && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleRefresh} 
                  disabled={isLoading || isSaving || isSubmitting}
                  className="ml-2"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('refreshData')}
                </Button>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={readOnly}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={readOnly}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {t('importData')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('progress')}</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {lastSaved && (
            <p className="text-sm text-muted-foreground mb-2">
              {t('lastSaved')}: {new Date(lastSaved).toLocaleString()}
            </p>
          )}
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {t('unsavedChanges')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form content */}
      <Card>
        <CardContent className="p-0">
          <DataEntryFormContent 
            category={category}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {Object.keys(errors).length > 0 && (
            <span className="text-red-600">
              {Object.keys(errors).length} {t('errorsFound')}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || readOnly}
          >
            {isSaving ? (
              <>{t('saving')}...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                {t('saveDraft')}
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || completionPercentage < 100 || readOnly || Object.keys(errors).length > 0}
          >
            {isSubmitting ? (
              <>{t('submitting')}...</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                {t('submitForApproval')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataEntryFormManager;
