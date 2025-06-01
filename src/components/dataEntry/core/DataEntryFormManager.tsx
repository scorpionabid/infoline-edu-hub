import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Save, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntryStatus } from '@/types/dataEntry';
import { StatusPermissions } from '@/hooks/auth/useStatusPermissions';
import { ImportResult } from '@/types/excel';
import { useForm, FormProvider } from 'react-hook-form';
import FormFields from './FormFields';
import DataEntryFormContent from './DataEntryFormContent';
import ExcelActions from '@/components/dataEntry/ExcelActions';
import { useExcelImport } from '@/hooks/excel/useExcelImport';
import { useExcelExport } from '@/hooks/excel/useExcelExport';

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
  
  // ✅ YENİ: Status-related props
  entryStatus?: DataEntryStatus;
  statusPermissions?: StatusPermissions;
  onStatusTransition?: (newStatus: DataEntryStatus, comment?: string) => Promise<void>;
  onApprove?: (comment?: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onReset?: () => Promise<void>;
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
  readOnly = false,
  
  // ✅ YENİ: Status-related props
  entryStatus,
  statusPermissions,
  onStatusTransition,
  onApprove,
  onReject,
  onReset
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // ✅ YENİ: Approval/rejection dialog states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ YENİ: Enhanced Excel hooks
  const excelImport = useExcelImport({
    category,
    schoolId,
    onImportComplete: handleExcelImportComplete,
    onProgress: (progress) => {
      console.log('Excel import progress:', progress);
      // Bu progress məlumatını istifadəçiyə göstərmək üçün istifadə edə bilərik
    }
  });
  
  const excelExport = useExcelExport({
    category,
    schoolId,
    onExportComplete: (success) => {
      if (success) {
        toast({
          title: t('success'),
          description: t('dataExportedSuccessfully')
        });
      }
    }
  });

  // Handle Excel import completion
  function handleExcelImportComplete(result: ImportResult) {
    if (result.success) {
      // Refresh form data after successful import
      onRefresh?.();
      
      toast({
        title: t('success'),
        description: t('excelImportCompleted').replace('{count}', String(result.successfulRows))
      });
    } else {
      toast({
        title: t('error'),
        description: result.message || t('excelImportFailed'),
        variant: 'destructive'
      });
    }
  }

  // Initialize React Hook Form
  const formMethods = useForm({
    defaultValues: formData || {},
    mode: 'onChange'
  });

  // Track if form is being programmatically updated to prevent loops
  const isUpdatingRef = React.useRef(false);

  // Sync form data with external formData prop (only when not updating internally)
  useEffect(() => {
    if (formData && typeof formData === 'object' && !isUpdatingRef.current) {
      Object.keys(formData).forEach(key => {
        const currentValue = formMethods.getValues(key);
        if (currentValue !== formData[key]) {
          formMethods.setValue(key, formData[key], { shouldValidate: false });
        }
      });
    }
  }, [formData, formMethods]);

  // Watch form changes and sync with parent (debounced to prevent loops)
  useEffect(() => {
    const subscription = formMethods.watch((values, { name, type }) => {
      if (values && typeof values === 'object' && !isUpdatingRef.current) {
        isUpdatingRef.current = true;
        
        // Use setTimeout to debounce updates
        setTimeout(() => {
          onFormDataChange(values);
          setHasUnsavedChanges(true);
          isUpdatingRef.current = false;
        }, 100);
      }
    });
    return () => subscription.unsubscribe();
  }, [formMethods, onFormDataChange]);

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

  // ✅ YENİ: Handle approval with comment
  const handleApprovalClick = useCallback(() => {
    setShowApprovalDialog(true);
  }, []);

  const handleApprovalConfirm = useCallback(async () => {
    try {
      await onApprove?.(approvalComment);
      setShowApprovalDialog(false);
      setApprovalComment('');
      toast({
        title: t('success'),
        description: t('dataApproved'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorApprovingData'),
        variant: 'destructive'
      });
    }
  }, [onApprove, approvalComment, t, toast]);

  // ✅ YENİ: Handle rejection with reason
  const handleRejectionClick = useCallback(() => {
    setShowRejectionDialog(true);
  }, []);

  const handleRejectionConfirm = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: t('error'),
        description: t('rejectionReasonRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      await onReject?.(rejectionReason);
      setShowRejectionDialog(false);
      setRejectionReason('');
      toast({
        title: t('success'),
        description: t('dataRejected'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorRejectingData'),
        variant: 'destructive'
      });
    }
  }, [onReject, rejectionReason, t, toast]);

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
                
                {/* ✅ YENİ: Status badge */}
                {entryStatus && entryStatus !== 'draft' && (
                  <Badge 
                    variant={
                      entryStatus === 'approved' ? 'default' :
                      entryStatus === 'pending' ? 'secondary' :
                      entryStatus === 'rejected' ? 'destructive' : 'outline'
                    }
                    className="ml-2"
                  >
                    {entryStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {entryStatus === 'pending' && <RefreshCw className="w-3 h-3 mr-1" />}
                    {entryStatus === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {t(entryStatus)}
                  </Badge>
                )}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* ✅ YENİ: Enhanced Excel Actions */}
              <ExcelActions
                category={category}
                schoolId={schoolId}
                userId={user?.id}
                onImportComplete={handleExcelImportComplete}
                // Legacy compatibility
                onDownloadLegacy={onExportTemplate}
                onUploadLegacy={onImportData}
              />
              
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
          <FormProvider {...formMethods}>
            <DataEntryFormContent 
              category={category}
              readOnly={readOnly}
            />
          </FormProvider>
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
          {/* ✅ YENİ: Status-aware action buttons */}
          {statusPermissions?.canEdit && (
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
          )}
          
          {statusPermissions?.canSubmit && (
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
          )}
          
          {/* Approval actions for reviewers */}
          {statusPermissions?.canApprove && (
            <Button
              variant="default"
              onClick={handleApprovalClick}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('approve')}
            </Button>
          )}
          
          {statusPermissions?.canReject && (
            <Button
              variant="destructive"
              onClick={handleRejectionClick}
              disabled={isLoading}
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {t('reject')}
            </Button>
          )}
          
          {statusPermissions?.canReset && (
            <Button
              variant="outline"
              onClick={() => onReset?.()}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {t('resetToDraft')}
            </Button>
          )}
        </div>
      </div>
      
      {/* ✅ YENİ: Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('approveData')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">{t('approvalComment')} ({t('optional')})</Label>
              <Textarea
                id="approval-comment"
                placeholder={t('enterApprovalComment')}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalDialog(false);
                setApprovalComment('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleApprovalConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* ✅ YENİ: Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectData')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">{t('rejectionReason')} <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection-reason"
                placeholder={t('enterRejectionReason')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectionConfirm}
              disabled={!rejectionReason.trim()}
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataEntryFormManager;
