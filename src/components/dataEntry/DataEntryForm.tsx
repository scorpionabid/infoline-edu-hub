
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Save,
  Send,
  Upload,
  Download
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataEntryFields from './DataEntryFields';
import { Badge } from '@/components/ui/badge';
import { Button as ButtonComponent } from '@/components/ui/button';
import { CategoryWithColumns } from '@/types/column';

interface DataEntryFormProps {
  category: CategoryWithColumns;
  dataEntries: { [key: string]: string };
  errors: { [key: string]: string };
  submitting: boolean;
  isAutoSaving: boolean;
  categoryStatus: 'pending' | 'approved' | 'rejected';
  isReadOnly?: boolean;
  onDataChange: (columnId: string, value: string) => void;
  onSubmit: () => void;
  downloadExcelTemplate?: () => void;
  uploadExcelData?: (file: File) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  category,
  dataEntries,
  errors,
  submitting,
  isAutoSaving,
  categoryStatus,
  isReadOnly = false,
  onDataChange,
  onSubmit,
  downloadExcelTemplate,
  uploadExcelData
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('formFill');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sütunları qruplara bölmək
  const groupColumns = (columns: Column[]) => {
    return columns.reduce((acc: { [key: string]: Column[] }, column) => {
      const parentId = column.parentColumnId || 'main';
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(column);
      return acc;
    }, {});
  };

  const groupedColumns = groupColumns(category.columns);
  const mainColumns = groupedColumns['main'] || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && uploadExcelData) {
      uploadExcelData(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Son tarix kontrolu
  const hasDeadline = category.category.deadline || category.deadline;
  const isOverdue = hasDeadline ? new Date(hasDeadline) < new Date() : false;
  const isDueSoon = hasDeadline 
    ? new Date(hasDeadline).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 // 3 gün
    : false;
  const daysLeft = hasDeadline 
    ? Math.max(0, Math.ceil((new Date(hasDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{category.category.name}</CardTitle>
            {category.category.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.category.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            {(downloadExcelTemplate || uploadExcelData) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab(activeTab === 'formFill' ? 'excel' : 'formFill')}
                className="min-w-[100px]"
              >
                {activeTab === 'formFill' ? t('excelMode') : t('formMode')}
              </Button>
            )}

            {hasDeadline && (
              <Badge variant={isOverdue ? 'destructive' : isDueSoon ? 'warning' : 'outline'} className="flex gap-1 items-center">
                <Calendar className="h-3 w-3" />
                <span>
                  {isOverdue 
                    ? t('deadlinePassed') 
                    : daysLeft === 0 
                      ? t('deadlineToday')
                      : t('daysLeft', { count: daysLeft })}
                </span>
              </Badge>
            )}

            <Badge
              variant={
                categoryStatus === 'approved' 
                  ? 'success' 
                  : categoryStatus === 'rejected' 
                    ? 'destructive' 
                    : 'outline'
              }
              className="flex gap-1 items-center"
            >
              {categoryStatus === 'approved' && <CheckCircle className="h-3 w-3" />}
              {categoryStatus === 'rejected' && <XCircle className="h-3 w-3" />}
              {categoryStatus === 'pending' && <AlertCircle className="h-3 w-3" />}
              <span>
                {categoryStatus === 'approved' 
                  ? t('approved') 
                  : categoryStatus === 'rejected' 
                    ? t('rejected') 
                    : t('pending')}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="formFill" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              {t('formFill')}
            </TabsTrigger>
            {(downloadExcelTemplate || uploadExcelData) && (
              <TabsTrigger value="excel" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                {t('excelUpload')}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="formFill" className="p-0 m-0">
            <DataEntryFields 
              columns={mainColumns} 
              groupedColumns={groupedColumns}
              entries={dataEntries}
              errors={errors}
              isReadOnly={isReadOnly || categoryStatus === 'approved'}
              onChange={onDataChange}
            />

            <div className="flex flex-wrap justify-between gap-4 mt-6">
              <div className="flex items-center text-sm text-muted-foreground">
                {isAutoSaving && (
                  <span className="flex items-center">
                    <span className="animate-pulse mr-2">●</span>
                    {t('autoSaving')}
                  </span>
                )}
              </div>
              
              {!isReadOnly && categoryStatus !== 'approved' && (
                <div className="flex flex-wrap gap-2 ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => onDataChange('_save', 'true')}
                    disabled={submitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t('saveAsDraft')}
                  </Button>
                  
                  <Button
                    onClick={onSubmit}
                    disabled={submitting || Object.keys(errors).length > 0}
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin mr-2">●</span>
                        {t('submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('submitForApproval')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {(downloadExcelTemplate || uploadExcelData) && (
            <TabsContent value="excel" className="p-0 m-0">
              <div className="space-y-6 border rounded-md p-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('excelInstructions')}</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>{t('excelInstructionDownload')}</li>
                    <li>{t('excelInstructionFill')}</li>
                    <li>{t('excelInstructionUpload')}</li>
                  </ol>
                </div>
                
                <div className="flex items-center gap-4">
                  {downloadExcelTemplate && (
                    <ButtonComponent 
                      variant="outline" 
                      onClick={downloadExcelTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('downloadTemplate')}
                    </ButtonComponent>
                  )}
                </div>
                
                {uploadExcelData && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">{t('uploadExcel')}</h3>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="border p-2 rounded-md"
                      />
                      
                      {selectedFile && (
                        <div className="flex items-center gap-2">
                          <span>{t('selectedFile')}: {selectedFile.name}</span>
                          <Badge>{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                        </div>
                      )}
                      
                      <ButtonComponent 
                        onClick={handleUpload} 
                        disabled={!selectedFile || submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="animate-spin mr-2">●</span>
                            {t('uploading')}
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            {t('uploadAndProcess')}
                          </>
                        )}
                      </ButtonComponent>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center text-yellow-600 bg-yellow-50 p-4 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{t('excelWarning')}</p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataEntryForm;
