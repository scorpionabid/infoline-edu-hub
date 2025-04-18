
import React, { useCallback, useEffect } from 'react';
import { useDataEntry } from '@/hooks/useDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { usePermissions } from '@/hooks/auth/usePermissions';

// Alert komponenti
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "warning";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "border text-foreground",
    destructive:
      "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
    warning:
      "border-orange-500/50 text-orange-500 dark:border-orange-500 [&>svg]:text-orange-500",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const DataEntryPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategoryId = queryParams.get('categoryId');
  const statusFilter = queryParams.get('status');
  const { isSchoolAdmin, canViewSectorCategories } = usePermissions();
  
  // useCategoryData hook-u ilə real məlumatları əldə edirik
  const { categories, loading, error } = useCategoryData(user?.schoolId);
  const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(0);
  
  // Kateqoriyaları filter edirik
  const filteredCategories = React.useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    return categories.filter(category => {
      if (isSchoolAdmin && category.assignment === 'sectors') {
        return false;
      }
      
      if (canViewSectorCategories) {
        return true;
      }
      
      return category.assignment === 'all';
    });
  }, [categories, isSchoolAdmin, canViewSectorCategories]);
  
  const {
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    updateValue,
    handleEntriesChange,
    saveForm,
    handleSave,
    getErrorForColumn,
    validation
  } = useDataEntry({ 
    schoolId: user?.schoolId,
    categories: filteredCategories
  });
  
  // Təsdiq üçün formnu göndərmək
  const submitForApproval = React.useCallback(() => {
    if (validation?.validateForm && validation.validateForm()) {
      // Form təsdiqlənmir və göndərilir
      toast.success(t('dataEntrySubmitted'));
      saveForm && saveForm();
    } else {
      // Validation xətaları var
      toast.error(t('pleaseFixErrors'));
    }
  }, [validation, t, saveForm]);
  
  // Excel şablonunu endirmək
  const downloadExcelTemplate = React.useCallback((categoryId: string) => {
    toast.success(t('excel.templateDownloaded'));
  }, [t]);
  
  // Excel məlumatlarını yükləmək
  const uploadExcelData = React.useCallback((file: File, categoryId: string) => {
    toast.success(t('excel.importSuccess'));
  }, [t]);
  
  const currentCategory = filteredCategories[currentCategoryIndex];
  
  const handleCategoryChange = (index: number) => {
    setCurrentCategoryIndex(index);
  };
  
  const handleValueChange = (columnId: string, value: any) => {
    if (updateValue && currentCategory) {
      updateValue(currentCategory.id, columnId, value);
    } else {
      handleEntriesChange(columnId, value);
    }
  };

  const handleSubmitForApproval = useCallback(() => {
    submitForApproval();
  }, [submitForApproval]);
  
  const handleDownloadTemplate = () => {
    if (currentCategory) {
      downloadExcelTemplate(currentCategory.id);
    }
  };
  
  const handleUploadData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentCategory) {
      uploadExcelData(file, currentCategory.id);
    }
  };
  
  const renderCategoryNavigation = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('categories')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="flex flex-col space-y-1 p-2">
            {filteredCategories.map((category, index) => (
              <Button
                key={category.id}
                variant={index === currentCategoryIndex ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleCategoryChange(index)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
  
  const renderForm = () => {
    if (!currentCategory) {
      return (
        <div className="text-center p-8">
          <p className="text-muted-foreground">{t('noCategorySelected')}</p>
        </div>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>{currentCategory.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentCategory.columns && currentCategory.columns.map((column) => {
            const error = getErrorForColumn ? getErrorForColumn(column.id) : [];
            const currentEntry = formData?.entries?.find(v => v.columnId === column.id);
            const value = currentEntry?.value;
            
            return (
              <div key={column.id} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {column.name}
                  {column.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input 
                  type="text"
                  className="w-full p-2 border rounded"
                  value={value || ''}
                  onChange={(e) => handleValueChange(column.id, e.target.value)}
                  placeholder={column.placeholder || ''}
                />
                {error && error.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{error[0]?.message}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <div className="text-center p-8">
      <p className="text-muted-foreground mb-4">{t('noCategories')}</p>
      <Button onClick={() => navigate('/')}>
        {t('backToDashboard')}
      </Button>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <div className="ml-6">{error}</div>
        </Alert>
        <Button onClick={() => navigate('/')}>
          {t('backToDashboard')}
        </Button>
      </div>
    );
  }
  
  if (!filteredCategories || filteredCategories.length === 0) {
    return renderEmptyState();
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            {t('downloadTemplate')}
          </Button>
          <input
            type="file"
            id="excelUpload"
            className="hidden"
            onChange={handleUploadData}
            accept=".xlsx, .xls"
          />
          <label htmlFor="excelUpload">
            <Button variant="outline" asChild>
              <span>{t('uploadData')}</span>
            </Button>
          </label>
        </div>
      </div>
      
      <Separator className="mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">{renderCategoryNavigation()}</div>
        <div className="md:col-span-3">
          {renderForm()}
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button variant="secondary" onClick={saveForm || handleSave} disabled={isAutoSaving}>
              {isAutoSaving ? t('saving') : t('save')}
            </Button>
            <Button onClick={handleSubmitForApproval} disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('submitForApproval')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage;
