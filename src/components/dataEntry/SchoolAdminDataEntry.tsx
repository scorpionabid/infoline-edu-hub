import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, selectUser } from "@/hooks/auth/useAuthStore";
import { useDataEntryManager } from "@/hooks/dataEntry/useDataEntryManager";
import { DataEntryForm } from "@/components/dataEntry/DataEntryForm";
import AutoSaveIndicator from "@/components/dataEntry/core/AutoSaveIndicator";
import ProgressTracker from "@/components/dataEntry/core/ProgressTracker";
import ExcelIntegrationPanel from "@/components/dataEntry/enhanced/ExcelIntegrationPanel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Save, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Grid3X3,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  // FileSpreadsheet
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { CategoryWithColumns } from "@/types/category";

type ViewMode = 'category-selection' | 'data-entry' | 'review-submit';

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
  
  // Navigation state from dashboard
  const navigationState = location.state as {
    mode?: ViewMode;
    categoryId?: string;
    focusColumnId?: string;
    returnUrl?: string;
  } | null;

  // View mode state
  const [mode, setMode] = useState<ViewMode>(navigationState?.mode || 'category-selection');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | null>(null);
  const [focusColumnId, setFocusColumnId] = useState<string | null>(navigationState?.focusColumnId || null);
  const [returnUrl, setReturnUrl] = useState<string>(navigationState?.returnUrl || '/dashboard');
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [saveAttempts, setSaveAttempts] = useState(0);

  // Get school ID from user data
  const schoolId = user?.school_id || user?.schoolId;

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
    loadData,
  } = dataManager;

  // Handle navigation from dashboard
  useEffect(() => {
    console.log('Navigation state changed:', navigationState);
    if (navigationState?.categoryId && categories.length > 0) {
      const category = categories.find(cat => cat.id === navigationState.categoryId);
      if (category) {
        console.log('Setting category and focus column:', category.name, navigationState.focusColumnId);
        setSelectedCategory(category);
        setMode('data-entry');
        // Set focus column after category is selected
        if (navigationState.focusColumnId) {
          setFocusColumnId(navigationState.focusColumnId);
        }
      }
    }
  }, [navigationState, categories]);

  // Clear navigation state after initial setup is complete
  useEffect(() => {
    if (navigationState && selectedCategory && mode === 'data-entry') {
      // Only clear navigation state after we've set up the component properly
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true });
      }, 100); // Small delay to ensure state is set
      
      return () => clearTimeout(timer);
    }
  }, [navigationState, selectedCategory, mode, navigate, location.pathname]);

  // Load data when category changes
  useEffect(() => {
    if (selectedCategory && schoolId) {
      loadData();
    }
  }, [selectedCategory, schoolId, loadData]);

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
      const isComplete = requiredColumns === filledRequiredColumns;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalColumns,
        requiredColumns,
        filledColumns,
        filledRequiredColumns,
        completionPercentage,
        // isComplete
      };
    });

    const overallCompletion = categories.length > 0 ? 
      Math.round(stats.reduce((sum, stat) => sum + stat.completionPercentage, 0) / categories.length) : 0;
    
    const completedCategories = stats.filter(stat => stat.isComplete).length;

    return {
      categories: stats,
      overallCompletion,
      completedCategories,
      totalCategories: categories.length
    };
  }, [categories, formData, selectedCategory]);

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

  // Navigation handlers
  const handleCategorySelect = useCallback((category: CategoryWithColumns) => {
    setSelectedCategory(category);
    setMode('data-entry');
    // Clear focus column if switching to different category
    if (category.id !== selectedCategory?.id) {
      setFocusColumnId(null);
    }
  }, [selectedCategory]);

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

// Category Selection Mode Component
interface CategorySelectionModeProps {
  categories: CategoryWithColumns[];
  completionStats: any;
  onCategorySelect: (category: CategoryWithColumns) => void;
  onExcelImport: (data: any[]) => void;
}

const CategorySelectionMode: React.FC<CategorySelectionModeProps> = ({
  categories,
  completionStats,
  onCategorySelect,
  // onExcelImport
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Ümumi Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ümumi Tamamlanma</span>
                <span>{completionStats.overallCompletion}%</span>
              </div>
              <Progress value={completionStats.overallCompletion} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {completionStats.totalCategories}
                </div>
                <div className="text-sm text-muted-foreground">Toplam</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {completionStats.completedCategories}
                </div>
                <div className="text-sm text-muted-foreground">Tamamlandı</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {completionStats.totalCategories - completionStats.completedCategories}
                </div>
                <div className="text-sm text-muted-foreground">Qalıb</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel Integration */}
      <ExcelIntegrationPanel 
        category={null}
        data={[]}
        onImportComplete={onExcelImport}
      />

      <Separator />

      {/* Category Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Kateqoriyalar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryStats = completionStats.categories.find(
              (stat: any) => stat.categoryId === category.id
            );
            
            return (
              <CategoryCard
                key={category.id}
                category={category}
                stats={categoryStats}
                onSelect={() => onCategorySelect(category)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Category Card Component
interface CategoryCardProps {
  category: CategoryWithColumns;
  stats: any;
  onSelect: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, stats, onSelect }) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-md hover:scale-105 border-l-4"
      style={{
        borderLeftColor: stats?.isComplete ? '#16a34a' : 
                         stats?.completionPercentage > 0 ? '#eab308' : '#e5e7eb'
      }}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{category.name}</CardTitle>
          {stats?.isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : stats?.completionPercentage > 0 ? (
            <Clock className="h-5 w-5 text-yellow-600" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
          )}
        </div>
        {category.description && (
          <CardDescription className="text-sm">{category.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{stats?.completionPercentage || 0}%</span>
          </div>
          <Progress value={stats?.completionPercentage || 0} className="h-1.5" />
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stats?.filledColumns || 0} / {stats?.totalColumns || 0} sahə</span>
          <span>{stats?.filledRequiredColumns || 0} / {stats?.requiredColumns || 0} məcburi</span>
        </div>

        <Button variant="ghost" size="sm" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          Redaktə et
        </Button>
      </CardContent>
    </Card>
  );
};

// Data Entry Mode Component
interface DataEntryModeProps {
  category: CategoryWithColumns;
  schoolId: string;
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onFieldChange: (columnId: string, value: any) => void;
  entryStatus: string;
  isLoading: boolean;
  isSaving: boolean;
  isDataModified: boolean;
  lastSaved: Date | null;
  autoSaveError: string | null;
  saveAttempts: number;
  onManualSave: () => void;
  onRetryAutoSave: () => void;
  onResetAutoSaveError: () => void;
  onBack: () => void;
  onNext: () => void;
  completionStats: any;
  focusColumnId?: string | null;
  returnUrl?: string;
}

const DataEntryMode: React.FC<DataEntryModeProps> = ({
  category,
  schoolId,
  formData,
  onFormDataChange,
  onFieldChange,
  entryStatus,
  isLoading,
  isSaving,
  isDataModified,
  lastSaved,
  autoSaveError,
  saveAttempts,
  onManualSave,
  onRetryAutoSave,
  onResetAutoSaveError,
  onBack,
  onNext,
  completionStats,
  focusColumnId,
  // returnUrl
}) => {
  const categoryStats = completionStats.categories.find(
    (stat: any) => stat.categoryId === category.id
  );

  // Determine back button text based on return URL
  const backButtonText = returnUrl === '/dashboard' ? 'Dashboard-a qayıt' : 'Kateqoriyalara qayıt';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {backButtonText}
        </Button>
        <Button onClick={onNext}>
          Yekun baxış
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Auto Save Indicator */}
      <AutoSaveIndicator
        isSaving={isSaving}
        autoSaveEnabled={true}
        lastSaveTime={lastSaved}
        saveError={autoSaveError}
        saveAttempts={saveAttempts}
        hasUnsavedChanges={isDataModified}
        onManualSave={onManualSave}
        onRetry={onRetryAutoSave}
        onResetError={onResetAutoSaveError}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {category.name}
                <Badge variant="outline">{category.columns.length} sahə</Badge>
              </CardTitle>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <DataEntryForm
                category={category}
                schoolId={schoolId}
                formData={formData}
                onFormDataChange={onFormDataChange}
                onFieldChange={onFieldChange}
                readOnly={entryStatus === "approved"}
                isLoading={isLoading}
                focusColumnId={focusColumnId}
              />
            </CardContent>
          </Card>
        </div>

        {/* Progress Sidebar */}
        <div className="lg:col-span-1">
          <ProgressTracker
            columns={category.columns}
            formData={formData}
            completionPercentage={categoryStats?.completionPercentage || 0}
            hasAllRequiredFields={categoryStats?.isComplete || false}
            isValid={true}
          />
        </div>
      </div>
    </div>
  );
};

// Review Submit Mode Component
interface ReviewSubmitModeProps {
  categories: CategoryWithColumns[];
  formData: Record<string, any>;
  completionStats: any;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onEditCategory: (category: CategoryWithColumns) => void;
}

const ReviewSubmitMode: React.FC<ReviewSubmitModeProps> = ({
  categories,
  formData,
  completionStats,
  isSubmitting,
  onBack,
  onSubmit,
  // onEditCategory
}) => {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Redaktəyə qayıt
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Təsdiq üçün göndər
        </Button>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Məlumatların İcmalı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{completionStats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Toplam kateqoriya</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completionStats.completedCategories}</div>
              <div className="text-sm text-muted-foreground">Tamamlanmış</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completionStats.overallCompletion}%</div>
              <div className="text-sm text-muted-foreground">Ümumi progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Review */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryStats = completionStats.categories.find(
            (stat: any) => stat.categoryId === category.id
          );
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={categoryStats?.isComplete ? "default" : "secondary"}>
                      {categoryStats?.completionPercentage || 0}%
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEditCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={categoryStats?.completionPercentage || 0} className="mb-2" />
                <div className="text-sm text-muted-foreground">
                  {categoryStats?.filledRequiredColumns || 0} / {categoryStats?.requiredColumns || 0} məcburi sahə doldurulub
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolAdminDataEntry;