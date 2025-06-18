import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBulkProxyDataEntry } from '../hooks/useBulkProxyDataEntry';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// Doğrudan doğruya fayl yollarından import edib adlarını dəyişmədən istifadə edirik
import { CategorySelector } from './CategorySelector';
import { ColumnSelector } from './ColumnSelector';
import { SchoolsSelector } from './SchoolsSelector';
import { BulkDataInput } from './BulkDataInput';
import { Steps } from '@/components/ui/steps';

interface BulkProxyDataEntryProps {
  sectorId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

const BulkProxyDataEntry: React.FC<BulkProxyDataEntryProps> = ({
  sectorId,
  onComplete,
  onClose
}) => {
  const {
    // Data
    categories,
    columns,
    schools,
    
    // Selection state
    step,
    selectedCategory,
    selectedColumn,
    selectedSchools,
    bulkValue,
    
    // Loading states
    isLoadingCategories,
    isLoadingColumns,
    isLoadingSchools,
    isSaving,
    isSubmitting,
    
    // Error states
    saveError,
    submitError,
    
    // Step handlers
    nextStep,
    previousStep,
    
    // Selection handlers
    setSelectedCategory,
    setSelectedColumn,
    setSelectedSchools,
    setBulkValue,
    
    // Action handlers
    handleBulkSave,
    handleBulkSubmit
  } = useBulkProxyDataEntry({
    sectorId,
    onComplete
  });

  // Yükləmə vəziyyəti
  if (
    (step === 1 && isLoadingCategories) ||
    (step === 2 && isLoadingColumns) ||
    (step === 3 && isLoadingSchools)
  ) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Məlumatlar yüklənir...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Topluca Data Daxil Etmə</h2>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Bağla
          </Button>
        )}
      </div>
      
      <Steps
        currentStep={step}
        steps={[
          { id: 1, label: 'Kateqoriya seç' },
          { id: 2, label: 'Sütun seç' },
          { id: 3, label: 'Məktəbləri seç' },
          { id: 4, label: 'Data daxil et' }
        ]}
      />
      
      <Card className="mt-4">
        <CardContent className="p-6">
          {/* Addım 1: Kateqoriya seç */}
          {step === 1 && (
            <CategorySelector
              categories={categories || []}
              selectedCategoryId={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          )}
          
          {/* Addım 2: Sütun seç */}
          {step === 2 && selectedCategory && (
            <ColumnSelector
              columns={columns || []}
              selectedColumnId={selectedColumn}
              onColumnSelect={setSelectedColumn}
              isLoading={isLoadingColumns}
            />
          )}
          
          {/* Addım 3: Məktəbləri seç */}
          {step === 3 && selectedCategory && selectedColumn && (
            <SchoolsSelector
              schools={schools || []}
              selectedSchoolIds={selectedSchools}
              onSchoolsSelect={setSelectedSchools}
            />
          )}
          
          {/* Addım 4: Data daxil et */}
          {step === 4 && selectedCategory && selectedColumn && selectedSchools.length > 0 && (
            <BulkDataInput
              schoolIds={selectedSchools}
              categoryId={selectedCategory}
              columnId={selectedColumn}
              value={bulkValue}
              onChange={setBulkValue}
              onSave={handleBulkSave}
              onSubmit={handleBulkSubmit}
              isSaving={isSaving}
              isSubmitting={isSubmitting}
              error={saveError || submitError}
              columns={columns || []}
              schools={schools || []}
            />
          )}
          
          {/* Naviqasiya düymələri */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button 
                onClick={previousStep} 
                variant="outline"
                disabled={isSaving || isSubmitting}
              >
                Geri
              </Button>
            )}
            
            {step < 4 && (
              <Button 
                onClick={nextStep} 
                disabled={
                  (step === 1 && !selectedCategory) ||
                  (step === 2 && !selectedColumn) ||
                  (step === 3 && selectedSchools.length === 0) ||
                  isSaving ||
                  isSubmitting
                }
                className="ml-auto"
              >
                İrəli
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkProxyDataEntry;
