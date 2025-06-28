import { CategoryWithColumns } from "@/types/category";

export interface CompletionStats {
  overallCompletion: number;
  totalCategories: number;
  completedCategories: number;
  categories: CategoryCompletionStat[];
}

export interface CategoryCompletionStat {
  categoryId: string;
  completionPercentage: number;
  fieldsCompleted: number;
  totalFields: number;
  
  // Əskik xassələr
  filledColumns: number;
  totalColumns: number;
  filledRequiredColumns: number;
  requiredColumns: number;
}

/**
 * Məlumat daxiletmə interfeysində istifadə edilən görünüş rejimləri
 */
export type ViewMode = 'category-selection' | 'data-entry' | 'review-submit';

/**
 * Kateqoriya seçimi rejiminin propsları
 */
export interface CategorySelectionModeProps {
  categories: CategoryWithColumns[];
  completionStats: CompletionStats;
  onCategorySelect: (category: CategoryWithColumns) => void;
  onExcelImport: (data: any[]) => void;
}

/**
 * Kateqoriya kartı komponentinin propsları
 */
export interface CategoryCardProps {
  category: CategoryWithColumns;
  stats: CategoryCompletionStat;
  onSelect: () => void;
}

/**
 * Məlumat daxiletmə rejiminin propsları
 */
export interface DataEntryModeProps {
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
  completionStats: CompletionStats;
  focusColumnId?: string | null;
  returnUrl?: string;
}

/**
 * Baxış və təsdiq rejiminin propsları
 */
export interface ReviewSubmitModeProps {
  categories: CategoryWithColumns[];
  formData: Record<string, any>;
  completionStats: CompletionStats;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onEditCategory: (category: CategoryWithColumns) => void;
}
