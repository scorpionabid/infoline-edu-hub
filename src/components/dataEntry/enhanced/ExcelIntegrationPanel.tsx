
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileDown, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useExcelIntegration } from '@/hooks/exports/useExcelIntegration';
import { CategoryWithColumns } from '@/types/category';

interface ExcelIntegrationPanelProps {
  category: CategoryWithColumns;
  formData: Record<string, any>;
  onDataImported: (data: Record<string, any>) => Promise<void>;
  disabled?: boolean;
}

const ExcelIntegrationPanel: React.FC<ExcelIntegrationPanelProps> = ({
  category,
  formData,
  onDataImported,
  disabled = false
}) => {
  const { t } = useLanguage();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const { downloadTemplate, importFromExcel, exportToExcel } = useExcelIntegration({
    categories: [category],
    onDataImported: async (data: Record<string, any>, categoryId: string) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        await onDataImported(data);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        setUploadResult({
          success: true,
          message: t('importSuccessful'),
          count: Object.keys(data).length
        });

        // Clear result after 5 seconds
        setTimeout(() => {
          setUploadResult(null);
          setUploadProgress(0);
        }, 5000);

      } catch (error) {
        setUploadResult({
          success: false,
          message: t('importFailed')
        });
      } finally {
        setIsUploading(false);
      }
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await importFromExcel(file, category.id);
    
    // Reset file input
    event.target.value = '';
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(category.id);
  };

  const handleExportData = () => {
    exportToExcel(category.id, formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('excelIntegration')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {t('downloadTemplate')}
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              disabled={disabled || isUploading}
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? t('importing') : t('importData')}
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={disabled || isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={disabled || Object.keys(formData).length === 0}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {t('exportData')}
          </Button>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('importing')}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload result */}
        {uploadResult && (
          <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
            {uploadResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {uploadResult.message}
              {uploadResult.count && ` (${uploadResult.count} ${t('fieldsImported')})`}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {t('downloadTemplateFirst')}</p>
          <p>• {t('fillTemplateWithData')}</p>
          <p>• {t('uploadCompletedTemplate')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelIntegrationPanel;
