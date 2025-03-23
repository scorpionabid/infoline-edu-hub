
import React, { useCallback, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Send, HelpCircle, ChevronLeft, RotateCw, FileSpreadsheet, Upload } from 'lucide-react';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryTabs from './CategoryTabs';
import DataEntryForm from './DataEntryForm';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/context/LanguageContext';
import ExcelActions from './ExcelActions';
import DataEntryDialogs from './DataEntryDialogs';
import StatusIndicators from './StatusIndicators';
import DataEntryProgress from './DataEntryProgress';

interface DataEntryContainerProps {
  initialCategoryId?: string | null;
}

const DataEntryContainer: React.FC<DataEntryContainerProps> = ({ initialCategoryId }) => {
  const {
    categories,
    currentCategoryIndex,
    formData,
    isAutoSaving,
    isSubmitting,
    isLoading,
    changeCategory,
    updateValue,
    submitForApproval,
    saveForm,
    getErrorForColumn,
    downloadExcelTemplate,
    uploadExcelData,
    errors
  } = useDataEntry(initialCategoryId);

  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const { t } = useLanguage();

  // Əmin olaq ki, categories mövcuddur
  const currentCategory = categories.length > 0 ? categories[currentCategoryIndex] : null;
  const currentEntryData = currentCategory ? formData.entries.find(entry => entry.categoryId === currentCategory.id) : null;

  // Yükləmə zamanı loader göstərmək
  useEffect(() => {
    if (isLoading) {
      document.body.style.cursor = 'wait';
    } else {
      document.body.style.cursor = 'default';
    }
    
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [isLoading]);

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

  const handleSubmitCurrentCategory = () => {
    // Əvvəlcə saxlayaq
    saveForm();
    
    // Sonra təsdiq dialoqunu açaq
    if (currentCategory && currentEntryData) {
      if (currentEntryData.isCompleted) {
        setIsSubmitDialogOpen(true);
      } else {
        toast({
          title: t('error'),
          description: t('completeAllRequiredFields'),
          variant: "destructive",
        });
      }
    }
  };

  const downloadCategoryTemplate = () => {
    if (currentCategory) {
      toast({
        title: t('downloadingTemplate'),
        description: t('downloadingCategoryTemplate'),
      });
      // İndiki kateqoriya üçün şablon yükləmə simulyasiyası
      setTimeout(() => {
        downloadExcelTemplate(currentCategory.id);
      }, 500);
    }
  };

  // Əgər yükləmə gedirsə, yükləmə ekranı göstərmək
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Səhifə başlığı, geri qayıtma düyməsi və izah */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-lg shadow-sm">
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
        
        {/* Əsas əməliyyat düymələri - Excel import/export, saxlama və təqdim etmə */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Son saxlama vaxtı göstəricisi */}
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
              {/* Excel ilə yüklə düyməsi */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => downloadExcelTemplate()}
                    disabled={isSubmitting || formData.status === 'approved'}
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {t('excelTemplate')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('downloadExcelTemplate')}</p>
                </TooltipContent>
              </Tooltip>

              {/* Excel şablonu düyməsi */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('excel-upload')?.click();
                    }}
                    disabled={isSubmitting || formData.status === 'approved'}
                    className="border-primary/20 text-primary hover:bg-primary/10"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('uploadExcel')}
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          uploadExcelData(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('uploadExcelData')}</p>
                </TooltipContent>
              </Tooltip>

              {/* Saxla düyməsi */}
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

              {/* Təsdiq üçün göndər düyməsi */}
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
                  <p>{t('submitForApprovalTooltip')}</p>
                </TooltipContent>
              </Tooltip>

              {/* Kömək düyməsi */}
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

      {/* Əsas məlumat kartı */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3 bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="text-xl">
                {t('formData')}
                <StatusIndicators 
                  errors={errors} 
                  status={formData.status} 
                />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            {/* Ümumi tamamlanma göstəriciləri */}
            <DataEntryProgress 
              overallProgress={formData.overallProgress} 
              completedEntries={formData.entries.filter(e => e.isCompleted).length}
              totalCategories={categories.length}
            />

            {categories.length > 0 && (
              <div className="mt-4 mb-6">
                <h3 className="text-lg font-semibold mb-2">{t('informationForm')}</h3>
                {/* Son tarix göstəricisi */}
                {currentCategory?.deadline && (
                  <div className="flex items-center text-amber-600 text-sm mb-4">
                    <span className="font-medium mr-2">⚠️ {t('deadline')}:</span>
                    <span className="font-bold">{new Date(currentCategory.deadline).toLocaleDateString('az-AZ', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                    <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      ({Math.ceil((new Date(currentCategory.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} {t('daysLeft')})
                    </span>
                  </div>
                )}
                
                {/* Kateqoriya tabları */}
                <CategoryTabs 
                  categories={categories} 
                  currentCategoryIndex={currentCategoryIndex} 
                  entries={formData.entries}
                  onCategoryChange={changeCategory} 
                />
              </div>
            )}

            {/* Aktiv kateqoriyanın məlumat daxiletmə formu */}
            {currentCategory && currentEntryData && (
              <div className="mt-4 bg-white dark:bg-slate-900 p-6 rounded-md shadow-sm border">
                <DataEntryForm 
                  category={currentCategory}
                  entryData={currentEntryData}
                  onValueChange={updateValue}
                  getErrorForColumn={getErrorForColumn}
                  isSubmitted={formData.status === 'approved'}
                  onSubmitCategory={handleSubmitCurrentCategory}
                />
              </div>
            )}
            
            {/* Aşağıda xəta və status məlumatları */}
            <StatusIndicators 
              errors={errors} 
              status={formData.status}
              showMessages={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialoqular (Submit və Help) */}
      <DataEntryDialogs 
        isSubmitDialogOpen={isSubmitDialogOpen}
        setIsSubmitDialogOpen={setIsSubmitDialogOpen}
        isHelpDialogOpen={isHelpDialogOpen}
        setIsHelpDialogOpen={setIsHelpDialogOpen}
        submitForApproval={submitForApproval}
      />
    </div>
  );
};

export default DataEntryContainer;
