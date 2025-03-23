
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Save, 
  Send, 
  Info, 
  Download, 
  Upload, 
  HelpCircle, 
  Check, 
  ChevronLeft,
  AlertTriangle,
  FileText,
  RotateCw,
  FileCheck
} from 'lucide-react';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryTabs from './CategoryTabs';
import DataEntryForm from './DataEntryForm';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogCancel, 
  AlertDialogAction 
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

const DataEntryContainer: React.FC = () => {
  const {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData,
    errors
  } = useDataEntry();

  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [excelDropdownOpen, setExcelDropdownOpen] = useState(false);
  const { t } = useLanguage();

  const currentCategory = categories[currentCategoryIndex];
  const currentEntryData = formData.entries.find(entry => entry.categoryId === currentCategory?.id);

  const formatTime = useCallback((isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleSubmitClick = () => {
    if (errors.length > 0) {
      toast({
        title: t('error'),
        description: t('fillAllRequiredFields'),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Excel faylını yükləmə simulyasiyası
      setTimeout(() => {
        uploadExcelData(file);
        setIsUploading(false);
        toast({
          title: t('excelDataUploaded'),
          description: t('dataSuccessfullyUploaded'),
        });
        // Faylı sıfırla
        if (fileInput) fileInput.value = '';
      }, 1500);
    }
  };

  const triggerFileInput = () => {
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSaveCurrentCategory = () => {
    saveForm();
    toast({
      title: t('categorySaved'),
      description: t('currentCategorySaved', { category: currentCategory?.name }),
    });
  };

  const downloadCategoryTemplate = () => {
    if (currentCategory) {
      toast({
        title: t('downloadingTemplate'),
        description: t('downloadingCategoryTemplate', { category: currentCategory.name }),
      });
      // İndiki kateqoriya üçün şablon yükləmə simulyasiyası
      setTimeout(() => {
        downloadExcelTemplate();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="p-0 h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{t('dataEntry')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('enterDataAndSubmit')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center">
            {isAutoSaving ? (
              <span className="flex items-center">
                <span className="animate-pulse mr-2 text-green-500">●</span> 
                {t('saving')}...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2 text-green-500">●</span> 
                {t('lastSaved')}: {formatTime(formData.lastSaved)}
              </span>
            )}
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveForm}
                      disabled={isAutoSaving || isSubmitting || formData.status === 'approved'}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {t('save')}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('saveDataManually')}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      variant={formData.status === 'submitted' ? "outline" : "default"}
                      size="sm"
                      onClick={handleSubmitClick}
                      disabled={isSubmitting || formData.status === 'approved' || errors.length > 0}
                    >
                      {formData.status === 'submitted' ? (
                        <>
                          <RotateCw className="mr-2 h-4 w-4" />
                          {t('resubmit')}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {isSubmitting ? t('sending') : t('submitForApproval')}
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formData.status === 'submitted' ? t('resubmitTooltip') : t('submitForApprovalTooltip')}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsHelpDialogOpen(true)}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('help')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="text-xl flex items-center flex-wrap gap-2">
                {t('formData')}
                {errors.length > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" /> {errors.length} {t('error', { count: errors.length })}
                  </Badge>
                )}
                {formData.status === 'submitted' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <FileText className="h-3 w-3 mr-1" /> {t('submitted')}
                  </Badge>
                )}
                {formData.status === 'approved' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <FileCheck className="h-3 w-3 mr-1" /> {t('approved')}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={(input) => setFileInput(input)}
                />
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setExcelDropdownOpen(!excelDropdownOpen)}
                      disabled={formData.status === 'approved'}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {t('excelTemplate')}
                    </Button>
                    
                    {excelDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                        <div className="p-2">
                          <button
                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => {
                              downloadExcelTemplate();
                              setExcelDropdownOpen(false);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t('downloadAllTemplate')}
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                            onClick={() => {
                              downloadCategoryTemplate();
                              setExcelDropdownOpen(false);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {t('downloadCurrentTemplate')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={triggerFileInput}
                    disabled={isUploading || formData.status === 'approved'}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? t('uploading') : t('uploadWithExcel')}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center">
                  {t('completion')}: 
                  <span className={cn(
                    "ml-1",
                    formData.overallProgress < 50 ? "text-red-500" :
                    formData.overallProgress < 80 ? "text-amber-500" :
                    "text-green-500"
                  )}>
                    {Math.round(formData.overallProgress)}%
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {formData.entries.filter(e => e.isCompleted).length} / {categories.length} {t('completed')}
                </span>
              </div>
              <Progress 
                value={formData.overallProgress} 
                className="h-2" 
                // Rəng ilə statusa uyğun progress bar
                indicatorClassName={cn(
                  formData.overallProgress < 50 ? "bg-red-500" :
                  formData.overallProgress < 80 ? "bg-amber-500" :
                  "bg-green-500"
                )}
              />
            </div>

            <CategoryTabs 
              categories={categories} 
              currentCategoryIndex={currentCategoryIndex} 
              entries={formData.entries}
              onCategoryChange={changeCategory} 
            />

            {currentCategory && currentEntryData && (
              <DataEntryForm 
                category={currentCategory}
                entryData={currentEntryData}
                onValueChange={updateValue}
                getErrorForColumn={getErrorForColumn}
                isSubmitted={formData.status === 'approved'}
                onSaveCategory={handleSaveCurrentCategory}
              />
            )}
            
            {formData.status === 'submitted' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start dark:bg-blue-900/20 dark:border-blue-800">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">{t('dataPendingApproval')}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('dataBeingReviewed')}</p>
                </div>
              </div>
            )}
            
            {formData.status === 'approved' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start dark:bg-green-900/20 dark:border-green-800">
                <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300">{t('dataApproved')}</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">{t('dataApprovedDesc')}</p>
                </div>
              </div>
            )}
            
            {errors.length > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                <h4 className="font-medium text-red-700 dark:text-red-300 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" /> {t('formHasErrors')}
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                  {errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                  {errors.length > 3 && (
                    <li>... {t('andOtherErrors', { count: errors.length - 3 })}</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Təsdiq sorğusu dialoqu */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('submitForApproval')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('submitWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={submitForApproval}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Yardım dialoqu */}
      <AlertDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('aboutDataEntry')}</AlertDialogTitle>
            <AlertDialogDescription>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>{t('helpTip1')}</li>
                <li>{t('helpTip2')}</li>
                <li>{t('helpTip3')}</li>
                <li>{t('helpTip4')}</li>
                <li>{t('helpTip5')}</li>
                <li>{t('helpTip6')}</li>
                <li>{t('helpTip7')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>{t('understood')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataEntryContainer;
