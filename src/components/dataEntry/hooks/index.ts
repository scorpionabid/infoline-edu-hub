// Hooks
export { useProxyDataEntry } from './useProxyDataEntry';

// Types for hooks
export interface UseProxyDataEntryProps {
  schoolId: string;
  categoryId: string;
  columnId?: string;
  onComplete?: () => void;
}

export interface UseProxyDataEntryReturn {
  // Data
  schoolData: any;
  categoryData: any;
  columns: any[];
  formData: Record<string, string>;
  
  // States
  isLoading: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  saveAttempts: number;
  
  // Handlers
  handleInputChange: (columnId: string, value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSave: () => void;
  resetError: () => void;
  retrySave: () => void;
}
