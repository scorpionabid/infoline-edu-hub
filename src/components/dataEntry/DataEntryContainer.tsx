
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Save, Send, Info } from 'lucide-react';
import { useDataEntry } from '@/hooks/useDataEntry';
import CategoryTabs from './CategoryTabs';
import DataEntryForm from './DataEntryForm';
import { Toaster } from '@/components/ui/toaster';

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
    getErrorForColumn
  } = useDataEntry();

  const currentCategory = categories[currentCategoryIndex];
  const currentEntryData = formData.entries.find(entry => entry.categoryId === currentCategory?.id);

  const formatTime = useCallback((isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Məlumat daxil etmə</h1>
          <p className="text-muted-foreground">
            Kateqoriyalar üzrə məlumatları daxil edin və təsdiq üçün göndərin
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground flex items-center">
            {isAutoSaving ? (
              <span className="flex items-center">
                <span className="animate-pulse mr-2">●</span> 
                Saxlanılır...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="mr-2">●</span> 
                Son saxlanma: {formatTime(formData.lastSaved)}
              </span>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={saveForm}
            disabled={isAutoSaving || isSubmitting || formData.status === 'submitted'}
          >
            <Save className="mr-2 h-4 w-4" />
            Saxla
          </Button>
          <Button 
            onClick={submitForApproval} 
            size="sm"
            disabled={isSubmitting || formData.status === 'submitted'}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Göndərilir...' : 'Təsdiq üçün göndər'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
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
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-700">Məlumatlar təsdiq gözləyir</h4>
                  <p className="text-sm text-blue-600">Məlumatlarınız sektor admini tərəfindən yoxlanılır və təsdiqlənəcək.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default DataEntryContainer;
