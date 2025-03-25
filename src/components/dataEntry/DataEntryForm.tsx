
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CategoryHeader from './components/CategoryHeader';
import FormField from './components/FormField';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDataEntry } from '@/hooks/useDataEntry';
import { 
  Check, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Save,
  Send,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import ApprovalAlert from './components/ApprovalAlert';
import RejectionAlert from './components/RejectionAlert';
import { CategoryWithColumns } from '@/types/column';
import { 
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { toast } from 'sonner';

interface DataEntryFormProps {
  initialCategoryId?: string | null; 
  statusFilter?: string | null; 
  onDataChanged?: () => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  initialCategoryId,
  statusFilter,
  onDataChanged
}) => {
  const { t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // useDataEntry hookundan məlumatları alırıq
  const {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    errors,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData
  } = useDataEntry(initialCategoryId);

  // Faylı yükləmək üçün referens
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Əgər kateqoriya olmasa və data yüklənmişsə, "Kateqoriya tapılmadı" mesajı göstəririk
  if (categories.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryForm')}</CardTitle>
          <CardDescription>{t('enterDataCarefully')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statusFilter ? t('noCategoriesWithSelectedStatus') : t('noCategoriesAvailable')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Yüklənir vəziyyəti
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryForm')}</CardTitle>
          <CardDescription>{t('enterDataCarefully')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">{t('loadingCategories')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  
  // Kateqoriyanın tamamlanma vəziyyətini hesablayırıq
  const getCurrentCategoryCompletion = () => {
    if (!currentCategory) return 0;
    
    const entry = formData.entries.find(e => e.categoryId === currentCategory.id);
    return entry ? entry.completionPercentage : 0;
  };
  
  // Kateqoriya təsdiq edilib mi?
  const isCategoryApproved = () => {
    if (!currentCategory) return false;
    return currentCategory.status === 'approved';
  };

  // Kateqoriya rədd edilib mi?
  const isCategoryRejected = () => {
    if (!currentCategory) return false;
    return currentCategory.status === 'rejected';
  };
  
  // Kateqoriyanın son tarixi yaxınlaşır?
  const isCategoryDueSoon = () => {
    if (!currentCategory || !currentCategory.deadline) return false;
    
    const deadline = new Date(String(currentCategory.deadline));
    const today = new Date();
    const diffDays = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 3;
  };
  
  // Kateqoriyanın son tarixi keçib?
  const isCategoryOverdue = () => {
    if (!currentCategory || !currentCategory.deadline) return false;
    
    const deadline = new Date(String(currentCategory.deadline));
    const today = new Date();
    
    return deadline < today;
  };
  
  // Excel şablonunu yükləmək
  const handleDownloadTemplate = () => {
    if (currentCategory) {
      downloadExcelTemplate(currentCategory.id);
    }
  };
  
  // Excel faylını seçmək
  const handleSelectExcelFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Excel faylını yükləmək
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && currentCategory) {
      const file = e.target.files[0];
      
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel') {
        toast.error(t('invalidFileType'), {
          description: t('pleaseSelectExcel')
        });
        return;
      }
      
      try {
        await uploadExcelData(file, currentCategory.id);
        if (onDataChanged) onDataChanged();
      } catch (error) {
        console.error('Excel upload error:', error);
      }
      
      // Input-u sıfırlayırıq ki, eyni faylı təkrar seçə bilək
      e.target.value = '';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dataEntryForm')}</CardTitle>
        <CardDescription>{t('enterDataCarefully')}</CardDescription>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p>{t('noCategoriesAvailable')}</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                {categories.map((category, index) => (
                  <Button
                    key={category.id}
                    variant={index === currentCategoryIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => changeCategory(index)}
                    className={cn(
                      "relative",
                      (category.status === 'rejected') && "border-red-500 text-red-500",
                      (category.status === 'approved') && "border-green-500 text-green-500",
                      isCategoryDueSoon() && "border-orange-500",
                      isCategoryOverdue() && "border-red-500"
                    )}
                  >
                    {category.name}
                    {category.status === 'pending' && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleDownloadTemplate}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t('downloadExcel')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={handleSelectExcelFile}
                >
                  <Upload className="h-4 w-4" />
                  {t('uploadExcel')}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            {currentCategory && (
              <>
                <CategoryHeader 
                  name={currentCategory.name}
                  description={currentCategory.description || ''}
                  deadline={typeof currentCategory.deadline === 'string' ? currentCategory.deadline : currentCategory.deadline?.toISOString()}
                  completionPercentage={getCurrentCategoryCompletion()}
                  isSubmitted={formData.status === 'submitted'}
                />
                <Separator className="my-4" />
                
                {currentCategory.status === 'approved' && (
                  <ApprovalAlert isApproved={true} />
                )}
                
                {currentCategory.status === 'rejected' && (
                  <RejectionAlert errorMessage={currentCategory.description || t('formRejected')} />
                )}
                
                <div className="space-y-4 mt-4">
                  {currentCategory.columns.map((column) => {
                    // Sütuna aid dəyər və xəta mesajını tapırıq
                    const entry = formData.entries.find(e => e.categoryId === currentCategory.id);
                    const valueObj = entry?.values.find(v => v.columnId === column.id);
                    const error = getErrorForColumn(column.id);
                    
                    return (
                      <FormField
                        key={column.id}
                        id={column.id}
                        label={column.name}
                        type={column.type}
                        required={column.isRequired}
                        disabled={formData.status === 'submitted' || currentCategory.status === 'approved'}
                        options={column.options as string[]}
                        placeholder={column.placeholder}
                        helpText={column.helpText}
                        value={valueObj?.value || ''}
                        onChange={(value) => {
                          updateValue(currentCategory.id, column.id, value);
                          if (onDataChanged) onDataChanged();
                        }}
                        error={error}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">
          {isAutoSaving && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
              <span>{t('saving')}...</span>
            </div>
          )}
          {formData.lastSaved && !isAutoSaving && (
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-green-500" />
              <span>{t('lastSaved')}: {new Date(formData.lastSaved).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={saveForm}
            disabled={isSubmitting || isAutoSaving || formData.status === 'submitted' || isCategoryApproved()}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            {t('saveDataManually')}
          </Button>
          <Button 
            onClick={submitForApproval}
            disabled={isSubmitting || formData.status === 'submitted' || isCategoryApproved()}
            className="gap-1"
          >
            {isSubmitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Send className="h-4 w-4" />}
            {formData.status === 'submitted' ? t('submitted') : t('submitForApproval')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DataEntryForm;
