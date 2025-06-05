
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, Send, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntryStatus } from '@/types/dataEntry';

interface DataEntryFormProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  
  // Save and submit handlers with proper return types
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  onExportTemplate?: () => Promise<void>;
  onUploadData?: (file: File) => Promise<void>;
  
  // Status management with proper return types  
  onStatusChange?: (newStatus: DataEntryStatus, comment?: string) => Promise<void>;
  onApprove?: (comment?: string) => Promise<void>;
  onReject?: (reason: string) => Promise<void>;
  onRequestApproval?: () => Promise<void>;
  
  // State
  isSaving?: boolean;
  isSubmitting?: boolean;
  isDirty?: boolean;
  hasErrors?: boolean;
  
  // Display options
  showActions?: boolean;
  readOnly?: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  children,
  title = 'Data Entry Form',
  className = '',
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          
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
                  {t('exportTemplate')}
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
                    {isUploading ? t('uploading') : t('uploadData')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('formHasErrors')}
            </AlertDescription>
          </Alert>
        )}
        
        {children}
        
        {showActions && !readOnly && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isDirty && t('unsavedChanges')}
            </div>
            
            <div className="flex gap-2">
              {onSave && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? t('saving') : t('save')}
                </Button>
              )}
              
              {onSubmit && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasErrors}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? t('submitting') : t('submit')}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryForm;
