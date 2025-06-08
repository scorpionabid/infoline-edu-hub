
import React, { useState, useEffect } from 'react';
import { AlertTriangle, School } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

// Import existing components
import { SimpleSchoolSelector } from './SimpleSchoolSelector';
import { CategoryNavigation } from './CategoryNavigation';
import { ProgressHeader } from './ProgressHeader';
import { FormActionBar } from './FormActionBar';
import { UnifiedDataEntryForm } from './unified';
import { useDataEntryQuickWins } from '@/hooks/dataEntry/useQuickWins';

interface DataEntryContentProps {
  displayCategories: any[];
  selectedSchoolId: string | null;
  selectedSchoolName: string;
  overallProgress: number;
  categoryStats: { completed: number; total: number };
  isSectorAdmin: boolean;
  schools?: any[];
  schoolSearchQuery?: string;
  setSchoolSearchQuery?: (query: string) => void;
  handleSchoolChange?: (schoolId: string) => void;
}

export const DataEntryContent: React.FC<DataEntryContentProps> = ({
  displayCategories,
  selectedSchoolId,
  selectedSchoolName,
  overallProgress,
  categoryStats,
  isSectorAdmin,
  schools = [],
  schoolSearchQuery = '',
  setSchoolSearchQuery,
  handleSchoolChange
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const {
    currentCategoryIndex,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext
  } = useDataEntryQuickWins(displayCategories || [], schools || []);

  // Progress Header
  const progressHeader = (
    <ProgressHeader
      schoolName={selectedSchoolName}
      overallProgress={overallProgress}
      categoriesCompleted={categoryStats.completed}
      totalCategories={categoryStats.total}
      isSectorAdmin={isSectorAdmin}
    />
  );

  // School Selector for sector admin
  const schoolSelector = isSectorAdmin && (
    <SimpleSchoolSelector
      schools={schools}
      selectedSchoolId={selectedSchoolId}
      onSchoolSelect={handleSchoolChange || (() => {})}
      searchQuery={schoolSearchQuery}
      onSearchChange={setSchoolSearchQuery || (() => {})}
    />
  );

  // Warning if no school selected for sector admin
  const noSchoolWarning = isSectorAdmin && !selectedSchoolId && (
    <Alert variant="default" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Məktəb seçilməyib</AlertTitle>
    </Alert>
  );

  // Warning if no categories available
  const noCategoriesWarning = !displayCategories?.length && (
    <Alert variant="default" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Kateqoriya yoxdur</AlertTitle>
    </Alert>
  );

  // Get selected category
  const selectedCategory = selectedCategoryId 
    ? displayCategories.find(cat => cat.id === selectedCategoryId)
    : null;

  // Main content area
  const mainContent = selectedSchoolId && displayCategories?.length > 0 && (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left sidebar - Category Navigation */}
      <div className="lg:col-span-1">
        <CategoryNavigation
          categories={displayCategories}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
      </div>
      
      {/* Main content area */}
      <div className="lg:col-span-3 space-y-6">
        {selectedCategoryId ? (
          <div className="space-y-6">
            {/* Render unified data entry form with selected category */}
            <UnifiedDataEntryForm 
              category={selectedCategory}
              showActions={true}
              readOnly={false}
            />
            
            {/* Enhanced Form Action Bar */}
            <FormActionBar
              onPrevious={canGoPrevious ? goToPrevious : undefined}
              onNext={canGoNext ? goToNext : undefined}
              canPrevious={canGoPrevious}
              canNext={canGoNext}
              currentIndex={currentCategoryIndex}
              totalCount={displayCategories.length}
              hasUnsavedChanges={false}
              onSave={async () => {
                toast.success('Yadda saxlanıldı');
              }}
              onSubmit={async () => {
                toast.success('Təqdim edildi');
              }}
            />
          </div>
        ) : (
          // Empty state when no category is selected
          <div className="empty-state-container">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <School className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Başlamaq üçün kateqoriya seçin
                </h3>
                <p className="text-gray-500 mt-1">
                  Kateqoriyalar siyahısından seçim edin
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {progressHeader}
      {schoolSelector}
      {noSchoolWarning}
      {noCategoriesWarning}
      {mainContent}
    </>
  );
};
