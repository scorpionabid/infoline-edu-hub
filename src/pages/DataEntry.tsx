
import React, { useCallback, useEffect } from 'react';
import { useDataEntry } from '@/hooks/useDataEntry';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import FormField from '@/components/dataEntry/components/FormField';
import { cn } from '@/lib/utils';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { CategoryWithColumns } from '@/types/column';

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
  
  const { categories, loading, error, refetch } = useCategoryData();
  const [currentCategoryIndex, setCurrentCategoryIndex] = React.useState(0);
  
  const {
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    updateValue,
    updateFormData,
    saveForm,
    getErrorForColumn,
    validation
  } = useDataEntry({ 
    schoolId: user?.schoolId,
    categories
  });
  
  // Təsdiq üçün formnu göndərmək
  const submitForApproval = React.useCallback(() => {
    if (validation.validateForm()) {
      // Form təsdiqlənmir və göndərilir
      toast.success(t('dataEntrySubmitted'));
      saveForm();
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
  
  const currentCategory = categories[currentCategoryIndex];
  
  const handleCategoryChange = (index: number) => {
    setCurrentCategoryIndex(index);
  };
  
  const handleValueChange = (columnId: string, value: any) => {
    updateValue(currentCategory.id, columnId, value);
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
            {categories.map((category, index) => (
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
          {currentCategory.columns.map((column) => {
            const error = getErrorForColumn(column.id);
            const currentEntry = formData.categories.find(e => e.categoryId === currentCategory.id);
            const valueObj = currentEntry?.entries.find(v => v.columnId === column.id);
            const value = valueObj?.value;
            
            return (
              <FormField
                key={column.id}
                id={column.id}
                type={column.type}
                name={column.name}
                value={value}
                onChange={(val) => handleValueChange(column.id, val)}
                placeholder={column.placeholder}
                helpText={column.help_text}
                options={column.options as { label: string; value: string }[]}
                validation={column.validation}
                isRequired={column.is_required}
                error={error}
              />
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
  
  if (!categories || categories.length === 0) {
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
            <Button variant="secondary" onClick={saveForm} disabled={isAutoSaving}>
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
