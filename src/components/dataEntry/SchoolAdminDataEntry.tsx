import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useDataEntryManager } from "@/hooks/dataEntry/useDataEntryManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { CategoryWithColumns } from "@/types/category";
import { CategorySelectionMode } from "./modes/CategorySelectionMode";
import { DataEntryMode } from "./modes/DataEntryMode";
import { ReviewSubmitMode } from "./modes/ReviewSubmitMode";
import { ViewMode, CompletionStats } from "./types";

/**
 * Məktəb Admin Məlumat Daxil Etmə Komponenti
 * 
 * Microsoft Forms üslubunda interfeys:
 * - Card-based category navigation
 * - Step-by-step form filling 
 * - Progress indicators
 * - Real-time auto-save
 * - Mobile-optimized design
 */
const SchoolAdminDataEntry: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  
  // Navigation state from dashboard - memoize edilib
  const navigationState = useMemo(() => 
    location.state as {
      mode?: ViewMode;
      categoryId?: string;
      focusColumnId?: string;
      returnUrl?: string;
    } | null, 
    [location.state]
  );

  // View mode state
  const [mode, setMode] = useState<ViewMode>(() => navigationState?.mode || 'category-selection');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | null>(null);
  const [focusColumnId, setFocusColumnId] = useState<string | null>(() => navigationState?.focusColumnId || null);
  const [returnUrl] = useState<string>(() => navigationState?.returnUrl || '/dashboard');
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Navigation state initialization flag - sadəcə bir dəfə işləmək üçün
  const navigationInitializedRef = useRef(false);

  // Get school ID from user data - memoize edilib
  const schoolId = useMemo(() => user?.school_id || user?.schoolId, [user?.school_id, user?.schoolId]);

  // Create a specific data manager for the selected category
  const dataManager = useDataEntryManager({
    schoolId: schoolId as string,
    categoryId: selectedCategory?.id,
    userId: user?.id,
    autoSave: true,
    enableRealTime: true,
  });

  // Categories manager for getting all categories
  const categoriesManager = useDataEntryManager({
    schoolId: schoolId as string,
    userId: user?.id,
    autoSave: false,
    enableRealTime: false,
  });

  // Use categories from the general manager, but form data from specific manager
  const {
    categories,
    loading,
    error,
    refetch,
  } = categoriesManager;

  const {
    formData,
    isLoading,
    isSubmitting,
    isSaving,
    isDataModified,
    entryStatus,
    lastSaved,
    autoSaveState,
    handleFormDataChange,
    handleFieldChange,
    handleSubmit,
    handleSave,
    resetForm,
  } = dataManager;

  // Handle navigation from dashboard - yalnız bir dəfə işləsin
  useEffect(() => {
    if (navigationInitializedRef.current || !navigationState?.categoryId || categories.length === 0) {
      return;
    }

    const category = categories.find(cat => cat.id === navigationState.categoryId);
    if (category) {
      console.log('Initializing navigation:', category.name, navigationState.focusColumnId);
      setSelectedCategory(category);
      setMode('data-entry');
      
      if (navigationState.focusColumnId) {
        setFocusColumnId(navigationState.focusColumnId);
      }
      
      navigationInitializedRef.current = true;
      
      // Clear navigation state
      setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 100);
    }
  }, [navigationState?.categoryId, navigationState?.focusColumnId, categories, navigate, location.pathname]);



  // Calculate completion statistics
  const completionStats = useMemo(() => {
    const stats = categories.map(category => {
      const totalColumns = category.columns.length;
      const requiredColumns = category.columns.filter(col => col.is_required).length;
      
      // If this is the selected category, use current form data
      let categoryFormData = {};
      if (selectedCategory && selectedCategory.id === category.id) {
        categoryFormData = formData;
      }
      
      const filledColumns = category.columns.filter(col => {
        const value = categoryFormData[col.id];
        return value && String(value).trim() !== '';
      }).length;
      
      const filledRequiredColumns = category.columns.filter(col => {
        if (!col.is_required) return false;
        const value = categoryFormData[col.id];
        return value && String(value).trim() !== '';
      }).length;

      const completionPercentage = totalColumns > 0 ? Math.round((filledColumns / totalColumns) * 100) : 0;
      
      // CompletionStats interface'ə uyğun sahələr
      return {
        categoryId: category.id,
        completionPercentage,
        fieldsCompleted: filledColumns,  // filledColumns -> fieldsCompleted
        totalFields: totalColumns        // totalColumns -> totalFields
      };
    });

    const overallCompletion = categories.length > 0 ? 
      Math.round(stats.reduce((sum, stat) => sum + stat.completionPercentage, 0) / categories.length) : 0;
    
    const completedCategories = stats.filter(stat => stat.completionPercentage === 100).length;

    return {
      categories: stats,
      overallCompletion,
      completedCategories,
      totalCategories: categories.length
    } as CompletionStats; // Tipləmənin düzgün olmasını təmin etmək üçün
  }, [categories, formData, selectedCategory?.id]);

  // Auto-save handlers
  const handleManualSave = useCallback(async () => {
    if (selectedCategory) {
      setSaveAttempts(prev => prev + 1);
      const success = await handleSave('draft');
      if (!success) {
        setAutoSaveError('Məlumatlar saxlanmadı. Zəhmət olmasa yenidən cəhd edin.');
      } else {
        setAutoSaveError(null);
        setSaveAttempts(0);
      }
    }
  }, [selectedCategory, handleSave]);

  const handleRetryAutoSave = useCallback(() => {
    setAutoSaveError(null);
    handleManualSave();
  }, [handleManualSave]);

  const handleResetAutoSaveError = useCallback(() => {
    setAutoSaveError(null);
    setSaveAttempts(0);
  }, []);

  // Excel integration handlers
  const handleExcelImport = useCallback((importedData: any[]) => {
    // Transform imported data to form data format
    const newFormData = { ...formData };
    importedData.forEach(row => {
      Object.entries(row).forEach(([columnId, value]) => {
        if (value !== null && value !== undefined) {
          newFormData[columnId] = value;
        }
      });
    });
    handleFormDataChange(newFormData);
  }, [formData, handleFormDataChange]);

  // Navigation handlers - stable reference
  const handleCategorySelect = useCallback((category: CategoryWithColumns) => {
    setSelectedCategory(category);
    setMode('data-entry');
    // Clear focus column if switching to different category
    if (category.id !== selectedCategory?.id) {
      setFocusColumnId(null);
    }
  }, [selectedCategory?.id]);

  const handleBackToSelection = useCallback(() => {
    // If there's a return URL, navigate back to dashboard
    if (returnUrl && returnUrl !== window.location.pathname) {
      navigate(returnUrl);
    } else {
      setMode('category-selection');
      setSelectedCategory(null);
      setFocusColumnId(null);
    }
  }, [navigate, returnUrl]);

  const handleGoToReview = useCallback(() => {
    setMode('review-submit');
  }, []);

  const handleBackToEntry = useCallback(() => {
    setMode('data-entry');
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    const success = await handleSubmit();
    if (success) {
      // Navigate back to dashboard after successful submit
      if (returnUrl && returnUrl !== window.location.pathname) {
        navigate(returnUrl);
      } else {
        setMode('category-selection');
        setSelectedCategory(null);
        setFocusColumnId(null);
      }
    }
  }, [handleSubmit, navigate, returnUrl]);

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p>{t("loadingData") || "Məlumatlar yüklənir..."}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Yenidən cəhd et
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No school assigned
  if (!schoolId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sizə hələ məktəb təyin edilməyib. Zəhmət olmasa, sistem administratoru
          ilə əlaqə saxlayın.
        </AlertDescription>
      </Alert>
    );
  }

  // No categories available
  if (categories.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Hal-hazırda məlumat daxil etmək üçün aktiv kateqoriya yoxdur.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Məlumat Daxil Etmə</h1>
          <p className="text-muted-foreground">
            Məktəbiniz üçün lazımi məlumatları daxil edin
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Overall Progress */}
          <div className="text-right">
            <div className="text-sm font-medium">
              {completionStats.completedCategories} / {completionStats.totalCategories} tamamlandı
            </div>
            <div className="text-xs text-muted-foreground">
              {completionStats.overallCompletion}% ümumi progress
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant={
              entryStatus === "approved"
                ? "default"
                : entryStatus === "pending"
                  ? "secondary"
                  : entryStatus === "rejected"
                    ? "destructive"
                    : "outline"
            }
          >
            {entryStatus === "approved"
              ? "Təsdiqləndi"
              : entryStatus === "pending"
                ? "Gözləyir"
                : entryStatus === "rejected"
                  ? "Rədd edildi"
                  : "Qaralama"}
          </Badge>
        </div>
      </div>

      {/* Mode-based Content */}
      {mode === 'category-selection' && (
        <CategorySelectionMode 
          categories={categories}
          completionStats={completionStats}
          onCategorySelect={handleCategorySelect}
          onExcelImport={handleExcelImport}
        />
      )}

      {mode === 'data-entry' && selectedCategory && (
        <DataEntryMode
          category={selectedCategory}
          schoolId={schoolId}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          onFieldChange={handleFieldChange}
          entryStatus={entryStatus}
          isLoading={isLoading}
          isSaving={isSaving}
          isDataModified={isDataModified}
          lastSaved={lastSaved}
          autoSaveError={autoSaveError || autoSaveState.error}
          saveAttempts={saveAttempts || autoSaveState.attempts}
          onManualSave={handleManualSave}
          onRetryAutoSave={handleRetryAutoSave}
          onResetAutoSaveError={handleResetAutoSaveError}
          onBack={handleBackToSelection}
          onNext={handleGoToReview}
          completionStats={completionStats}
          focusColumnId={focusColumnId}
          returnUrl={returnUrl}
        />
      )}

      {mode === 'review-submit' && (
        <ReviewSubmitMode
          categories={categories}
          formData={formData}
          completionStats={completionStats}
          isSubmitting={isSubmitting}
          onBack={handleBackToEntry}
          onSubmit={handleFinalSubmit}
          onEditCategory={handleCategorySelect}
        />
      )}
    </div>
  );
};



export default SchoolAdminDataEntry;