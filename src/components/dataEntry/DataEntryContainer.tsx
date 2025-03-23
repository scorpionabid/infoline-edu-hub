
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Save, Send, Info, Download, Upload, HelpCircle } from 'lucide-react';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryTabs from './CategoryTabs';
import DataEntryForm from './DataEntryForm';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    uploadExcelData
  } = useDataEntry();

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  const currentCategory = categories[currentCategoryIndex];
  const currentEntryData = formData.entries.find(entry => entry.categoryId === currentCategory?.id);

  const formatTime = useCallback((isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const handleSubmitClick = () => {
    // Əgər formada xətalar varsa, xəbərdarlıq əvəzinə dialoqu açırıq
    const canSubmit = true; // Bu funksiya useDataEntry-dən gələ bilər
    if (canSubmit) {
      setIsSubmitDialogOpen(true);
    } else {
      toast({
        title: "Xəta",
        description: "Zəhmət olmasa bütün məcburi sahələri doldurun",
        variant: "destructive",
      });
    }
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
          title: "Excel məlumatları yükləndi",
          description: "Məlumatlar uğurla yükləndi və forma yeniləndi",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Məlumat daxil etmə</h1>
          <p className="text-muted-foreground">
            Kateqoriyalar üzrə məlumatları daxil edin və təsdiq üçün göndərin
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center">
            {isAutoSaving ? (
              <span className="flex items-center">
                <span className="animate-pulse mr-2 text-green-500">●</span> 
                Saxlanılır...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2 text-green-500">●</span> 
                Son saxlanma: {formatTime(formData.lastSaved)}
              </span>
            )}
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={saveForm}
                    disabled={isAutoSaving || isSubmitting || formData.status === 'submitted'}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Saxla
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Məlumatları manual olaraq saxlayın</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSubmitClick}
                    disabled={isSubmitting || formData.status === 'submitted'}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Məlumatları təsdiq üçün göndərin</p>
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
                  <p>Yardım</p>
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
              <CardTitle className="text-xl">Form məlumatları</CardTitle>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                  ref={(input) => setFileInput(input)}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadExcelTemplate}
                  disabled={formData.status === 'submitted'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Excel Şablonu
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={triggerFileInput}
                  disabled={isUploading || formData.status === 'submitted'}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Yüklənir...' : 'Excel ilə yüklə'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Tamamlanma: {Math.round(formData.overallProgress)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {formData.entries.filter(e => e.isCompleted).length} / {categories.length} tamamlanıb
                </span>
              </div>
              <Progress value={formData.overallProgress} className="h-2" />
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
                isSubmitted={formData.status === 'submitted'}
              />
            )}
            
            {formData.status === 'submitted' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start dark:bg-blue-900/20 dark:border-blue-800">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Məlumatlar təsdiq gözləyir</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Məlumatlarınız sektor admini tərəfindən yoxlanılır və təsdiqlənəcək.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Təsdiq sorğusu dialoqu */}
      <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Təsdiq üçün göndərmə</AlertDialogTitle>
            <AlertDialogDescription>
              Məlumatlar təsdiq üçün göndərildikdən sonra düzəliş edə bilməyəcəksiniz. Davam etmək istədiyinizə əminsiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İmtina</AlertDialogCancel>
            <AlertDialogAction onClick={submitForApproval}>Təsdiq et</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Yardım dialoqu */}
      <AlertDialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Məlumat daxil etmə haqqında</AlertDialogTitle>
            <AlertDialogDescription>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Hər kateqoriyanı ayrı-ayrılıqda doldurmalısınız</li>
                <li>Ulduz (*) işarəsi olan sahələr mütləq doldurulmalıdır</li>
                <li>Daxil edilən məlumatlar avtomatik olaraq saxlanılır</li>
                <li>İstədiyiniz zaman manual olaraq "Saxla" düyməsindən istifadə edə bilərsiniz</li>
                <li>Excel şablonunu yükləyib doldurduqdan sonra "Excel ilə yüklə" funksiyası ilə məlumatları toplu şəkildə daxil edə bilərsiniz</li>
                <li>Bütün məlumatları doldurduqdan sonra "Təsdiq üçün göndər" düyməsini klikləyin</li>
                <li>Göndərilmiş formalar sektor admini tərəfindən yoxlanılaraq təsdiqlənəcək</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Anladım</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataEntryContainer;
