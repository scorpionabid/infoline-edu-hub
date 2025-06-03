import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, School, Building } from 'lucide-react';
import { useCategoryData } from '@/hooks/dataEntry/useCategoryData';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Enhanced Quick Wins Components
import { SimpleSchoolSelector } from '@/components/dataEntry/SimpleSchoolSelector';
import { CategoryNavigation } from '@/components/dataEntry/CategoryNavigation';
import { ProgressHeader } from '@/components/dataEntry/ProgressHeader';
import { FormActionBar } from '@/components/dataEntry/FormActionBar';

// Custom components and hooks
import DataEntryFormComponent from '@/components/dataEntry/DataEntryForm';
import { useSchoolSelector } from '@/hooks/dataEntry/useSchoolSelector';
import { useSectorCategories } from '@/hooks/dataEntry/useSectorCategories';
import { useDataEntryQuickWins } from '@/hooks/dataEntry/useQuickWins';

/**
 * Enhanced DataEntry Page Component with Quick Wins Features
 * 
 * This page allows users to enter data for various categories based on their permissions.
 * Features enhanced UI/UX with improved school selection, category navigation, and progress tracking.
 * For school users, it shows categories relevant to their school.
 * For sector admins, it allows selecting a school and viewing/entering data for that school.
 */
const DataEntry = () => {
  const { t } = useLanguage();
  const user = useAuthStore(selectUser);
  const permissions = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get('categoryId');
  const schoolIdFromUrl = queryParams.get('schoolId');
  
  // User role and permissions state
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('school');
  const isSectorAdmin = permissions?.isSectorAdmin === true;
  
  // Categories and school state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(schoolIdFromUrl);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');
  
  // Load categories based on current school
  const { categories, isLoading: categoriesLoading, error: categoriesError } = 
    useCategoryData({ schoolId: user?.school_id });
  
  // Load sector categories if user is sector admin
  const { 
    sectorCategories, 
    isLoading: sectorCategoriesLoading, 
    error: sectorCategoriesError 
  } = useSectorCategories({ isSectorAdmin });
  
  // Setup school selector for sector admin
  const {
    schools,
    filteredSchools,
    selectedSchoolId: schoolSelectorSelectedId,
    selectedSchoolName: schoolSelectorSelectedName,
    schoolSearchQuery,
    isLoading: schoolsLoading,
    setSchoolSearchQuery,
    handleSchoolChange,
    setSelectedSchoolId: setSchoolSelectorSelectedId,
    setSelectedSchoolName: setSchoolSelectorSelectedName
  } = useSchoolSelector({ 
    isSectorAdmin, 
    sectorId: user?.sector_id || null 
  });
  
  // Determine which categories to display
  const displayCategories = isSectorAdmin && tabValue === 'sector'
    ? sectorCategories
    : categories;
  
  // Enhanced Quick Wins functionality
  const {
    selectedCategoryId,
    setSelectedCategoryId,
    overallProgress,
    categoryStats,
    selectedSchool,
    currentCategoryIndex,
    canGoPrevious,
    canGoNext,
    goToPrevious,
    goToNext
  } = useDataEntryQuickWins(displayCategories || [], schools || []);
  
  // Sync selected school between hook and component
  useEffect(() => {
    if (schoolSelectorSelectedId && schoolSelectorSelectedId !== selectedSchoolId) {
      setSelectedSchoolId(schoolSelectorSelectedId);
      setSelectedSchoolName(schoolSelectorSelectedName || '');
    }
  }, [schoolSelectorSelectedId, schoolSelectorSelectedName]);
  
  // Auto-select school from URL if available
  useEffect(() => {
    if (schoolIdFromUrl && isSectorAdmin) {
      setSchoolSelectorSelectedId(schoolIdFromUrl);
      
      // Find and set school name
      const school = schools.find(s => s.id === schoolIdFromUrl);
      if (school) {
        setSchoolSelectorSelectedName(school.name);
        setSelectedSchoolName(school.name);
      }
    }
  }, [schools, schoolIdFromUrl, isSectorAdmin]);
  
  // Auto-select category from URL if available
  useEffect(() => {
    if (categoryIdFromUrl && displayCategories) {
      const categoryExists = displayCategories.find(cat => cat.id === categoryIdFromUrl);
      if (categoryExists) {
        setSelectedCategoryId(categoryIdFromUrl);
      }
    }
  }, [categoryIdFromUrl, displayCategories]);
  
  // Set loading state based on data fetching
  useEffect(() => {
    setLoading(
      categoriesLoading || 
      (isSectorAdmin && (sectorCategoriesLoading || schoolsLoading))
    );
  }, [categoriesLoading, sectorCategoriesLoading, schoolsLoading, isSectorAdmin]);
  
  // Determine which school ID to use based on user role
  const effectiveSchoolId = isSectorAdmin 
    ? selectedSchoolId 
    : user?.school_id || null;
  
  // Get selected school info for display
  const displaySchoolName = isSectorAdmin 
    ? selectedSchoolName 
    : user?.school_name || '';
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-15rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="container py-6 space-y-6">
      {/* Enhanced Progress Header */}
      <ProgressHeader
        schoolName={displaySchoolName}
        overallProgress={overallProgress}
        categoriesCompleted={categoryStats.completed}
        totalCategories={categoryStats.total}
        isSectorAdmin={isSectorAdmin}
      />
      
      {/* Tabs for sector admin */}
      {isSectorAdmin && (
        <Tabs value={tabValue} onValueChange={setTabValue} className="mb-6">
          <TabsList>
            <TabsTrigger value="school">
              <School className="mr-2 h-4 w-4" />
              {t('schoolCategories')}
            </TabsTrigger>
            <TabsTrigger value="sector">
              <Building className="mr-2 h-4 w-4" />
              {t('sectorCategories')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
      {/* Enhanced School Selector for sector admin */}
      {isSectorAdmin && tabValue === 'school' && (
        <SimpleSchoolSelector
          schools={schools || []}
          selectedSchoolId={selectedSchoolId}
          onSchoolSelect={(schoolId) => {
            handleSchoolChange(schoolId);
            // Reset category selection when changing schools
            setSelectedCategoryId(null);
          }}
          searchQuery={schoolSearchQuery}
          onSearchChange={setSchoolSearchQuery}
        />
      )}
      
      {/* Display warning if no school selected for sector admin */}
      {isSectorAdmin && tabValue === 'school' && !selectedSchoolId && (
        <Alert variant="default" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('noSchoolSelected')}</AlertTitle>
        </Alert>
      )}
      
      {/* Display categories or warning if none available */}
      {!displayCategories?.length ? (
        <Alert variant="default" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('noCategories')}</AlertTitle>
        </Alert>
      ) : (
        // Main content area with sidebar and form
        (tabValue === 'sector' || !isSectorAdmin || (isSectorAdmin && selectedSchoolId)) && (
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
                  {/* Render data entry form with selected category */}
                  <DataEntryFormComponent 
                    schoolId={effectiveSchoolId || undefined}
                    categories={displayCategories}
                    initialCategoryId={selectedCategoryId}
                    isSectorAdmin={isSectorAdmin}
                    schoolName={displaySchoolName}
                  />
                  
                  {/* Enhanced Form Action Bar */}
                  <FormActionBar
                    onPrevious={canGoPrevious ? goToPrevious : undefined}
                    onNext={canGoNext ? goToNext : undefined}
                    canPrevious={canGoPrevious}
                    canNext={canGoNext}
                    currentIndex={currentCategoryIndex}
                    totalCount={displayCategories.length}
                    hasUnsavedChanges={false} // This should come from form state
                    onSave={async () => {
                      // This should trigger save from the form component
                      toast.success(t('saved'));
                    }}
                    onSubmit={async () => {
                      // This should trigger submit from the form component
                      toast.success(t('submitted'));
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
                        {t('selectCategoryToStart')}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        {t('chooseFromCategoriesList')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DataEntry;