
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Send, Info, HelpCircle, ChevronLeft, RotateCw } from 'lucide-react';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryTabs from './CategoryTabs';
import DataEntryForm from './DataEntryForm';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import ExcelActions from './ExcelActions';
import DataEntryDialogs from './DataEntryDialogs';
import StatusIndicators from './StatusIndicators';
import DataEntryProgress from './DataEntryProgress';

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

  const handleSaveCurrentCategory = () => {
    saveForm();
    toast({
      title: t('categorySaved'),
      description: t('currentCategorySaved'),
    });
  };

  const downloadCategoryTemplate = () => {
    if (currentCategory) {
      toast({
        title: t('downloadingTemplate'),
        description: t('downloadingCategoryTemplate'),
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
                <StatusIndicators 
                  errors={errors} 
                  status={formData.status} 
                />
              </CardTitle>
              <ExcelActions 
                downloadExcelTemplate={downloadExcelTemplate} 
                downloadCategoryTemplate={downloadCategoryTemplate}
                uploadExcelData={uploadExcelData}
                formStatus={formData.status}
              />
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <DataEntryProgress 
              overallProgress={formData.overallProgress} 
              completedEntries={formData.entries.filter(e => e.isCompleted).length}
              totalCategories={categories.length}
            />

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
            
            <StatusIndicators 
              errors={errors} 
              status={formData.status}
              showMessages={true}
            />
          </CardContent>
        </Card>
      </div>

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
