
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, Send, FileText, Download, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntryStatus } from '@/types/dataEntry';
import { StatusPermissions } from '@/hooks/dataEntry/common/useStatusManager';
import FormFields from '@/components/dataEntry/core/FormFields';
import { CategoryWithColumns } from '@/types/category';

interface UnifiedDataEntryFormProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  category?: CategoryWithColumns | null;
  
  // Save and submit handlers with proper return types
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  onExportTemplate?: () => Promise<void>;
  onUploadData?: (file: File) => Promise<void>;
  
  // Status management
  onStatusChange?: (newStatus: DataEntryStatus, comment?: string) => Promise<void>;
  onApprove?: (comment?: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onRequestApproval?: () => Promise<void>;
  
  // State
  isSaving?: boolean;
  isSubmitting?: boolean;
  isDirty?: boolean;
  hasErrors?: boolean;
  
  // Status and permissions
  statusPermissions?: StatusPermissions;
  entryStatus?: DataEntryStatus;
  
  // Display options
  showActions?: boolean;
  readOnly?: boolean;
}

const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  children,
  title = 'Data Entry Form',
  className = '',
  category,
  onSave,
  onSubmit,
  onExportTemplate,
  onUploadData,
  onStatusChange,
  onApprove,
  onReject,
  onRequestApproval,
  isSaving = false,
  isSubmitting = false,
  isDirty = false,
  hasErrors = false,
  statusPermissions,
  entryStatus = DataEntryStatus.DRAFT,
  showActions = true,
  readOnly = false
}) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadData) {
      try {
        setIsUploading(true);
        await onUploadData(file);
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (onSave && !isSaving) {
      try {
        await onSave();
      } catch (error) {
        console.error('Save failed:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (onSubmit && !isSubmitting) {
      try {
        await onSubmit();
      } catch (error) {
        console.error('Submit failed:', error);
      }
    }
  };

  const handleExportTemplate = async () => {
    if (onExportTemplate) {
      try {
        await onExportTemplate();
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
  };

  const getStatusIcon = () => {
    switch (entryStatus) {
      case DataEntryStatus.APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case DataEntryStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case DataEntryStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusDisplay = () => {
    switch (entryStatus) {
      case DataEntryStatus.APPROVED:
        return t('approved') || 'Approved';
      case DataEntryStatus.PENDING:
        return t('pendingApproval') || 'Pending Approval';
      case DataEntryStatus.REJECTED:
        return t('rejected') || 'Rejected';
      default:
        return t('draft') || 'Draft';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>{title}</span>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon()}
              <span className="text-muted-foreground">{getStatusDisplay()}</span>
            </div>
          </div>
          
          {showActions && !readOnly && (
            <div className="flex items-center gap-2">
              {onExportTemplate && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('exportTemplate') || 'Export Template'}
                </Button>
              )}
              
              {onUploadData && (
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    {isUploading ? (t('uploading') || 'Uploading') : (t('uploadData') || 'Upload Data')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status alerts */}
        {statusPermissions?.alerts?.approval && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{statusPermissions.alerts.approval}</AlertDescription>
          </Alert>
        )}
        
        {statusPermissions?.alerts?.rejection && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{statusPermissions.alerts.rejection}</AlertDescription>
          </Alert>
        )}
        
        {statusPermissions?.alerts?.warning && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusPermissions.alerts.warning}</AlertDescription>
          </Alert>
        )}
        
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('formHasErrors') || 'Please fix the errors below'}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Form content */}
        {children || (category && category.columns && (
          <FormFields 
            columns={category.columns} 
            readOnly={readOnly || statusPermissions?.readOnly} 
            disabled={isSaving || isSubmitting}
          />
        ))}
        
        {/* Action buttons */}
        {showActions && statusPermissions?.showEditControls && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isDirty && (t('unsavedChanges') || 'You have unsaved changes')}
            </div>
            
            <div className="flex gap-2">
              {statusPermissions.allowedActions.includes('save') && onSave && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? (t('saving') || 'Saving') : (t('save') || 'Save')}
                </Button>
              )}
              
              {statusPermissions.allowedActions.includes('submit') && onSubmit && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasErrors}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? (t('submitting') || 'Submitting') : (t('submit') || 'Submit')}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedDataEntryForm;
